import Transaction from '../models/Transaction.model.js';
import Wallet from '../models/Wallet.model.js';
import Agent from '../models/Agent.model.js';

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/settlements?status=pending
// @desc    Get all agent withdrawal/settlement requests
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminGetSettlements = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const validStatuses = ['pending', 'completed', 'cancelled', 'all'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status filter' });
    }

    const filter = { category: 'payout_settlement' };
    if (status !== 'all') filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('ownerId', 'fullName agentId role mobile email')
      .sort({ createdAt: -1 });

    // Calculate totals for the stats row
    const pendingTotal = await Transaction.aggregate([
      { $match: { category: 'payout_settlement', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paidTotal = await Transaction.aggregate([
      { $match: { category: 'payout_settlement', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const formatted = transactions.map(t => ({
      txnId: t._id,
      transactionId: t.transactionId,
      agent: {
        name: t.ownerId?.fullName || 'Unknown',
        agentId: t.ownerId?.agentId || '-',
        role: t.ownerId?.role || '-',
        mobile: t.ownerId?.mobile || '-',
      },
      amount: t.amount,
      status: t.status,
      requestedAt: t.createdAt,
      description: t.detailDescription,
    }));

    res.status(200).json({
      success: true,
      data: {
        settlements: formatted,
        totalPending: pendingTotal[0]?.total || 0,
        totalPaid: paidTotal[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Admin Get Settlements Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/settlements/:txnId/approve
// @desc    Approve an agent's withdrawal request
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminApproveSettlement = async (req, res) => {
  try {
    const { txnId } = req.params;

    const txn = await Transaction.findById(txnId);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (txn.category !== 'payout_settlement') {
      return res.status(400).json({ success: false, message: 'Not a settlement transaction' });
    }
    if (txn.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Transaction is already ${txn.status}` });
    }

    // Update transaction status
    txn.status = 'completed';
    await txn.save();

    // Update agent wallet:
    // pendingCommissions -= amount (it was moved here when withdrawal was requested)
    // paidEarnings += amount
    await Wallet.findOneAndUpdate(
      { ownerId: txn.ownerId, ownerType: 'Agent' },
      {
        $inc: {
          pendingCommissions: -txn.amount,
          paidEarnings: txn.amount,
        },
        $set: { lastUpdatedAt: new Date() },
      }
    );

    res.status(200).json({
      success: true,
      message: `Settlement of ₹${txn.amount.toLocaleString('en-IN')} approved successfully`,
    });
  } catch (error) {
    console.error('Admin Approve Settlement Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PATCH /api/v1/admin/settlements/:txnId/reject
// @desc    Reject an agent's withdrawal request (returns amount to wallet)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminRejectSettlement = async (req, res) => {
  try {
    const { txnId } = req.params;

    const txn = await Transaction.findById(txnId);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (txn.category !== 'payout_settlement') {
      return res.status(400).json({ success: false, message: 'Not a settlement transaction' });
    }
    if (txn.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Transaction is already ${txn.status}` });
    }

    // Update transaction status
    txn.status = 'cancelled';
    await txn.save();

    // Reverse the wallet changes made when withdrawal was requested:
    // pendingCommissions -= amount
    // withdrawableBalance += amount (money returned)
    await Wallet.findOneAndUpdate(
      { ownerId: txn.ownerId, ownerType: 'Agent' },
      {
        $inc: {
          pendingCommissions: -txn.amount,
          withdrawableBalance: txn.amount, // return to withdrawable
        },
        $set: { lastUpdatedAt: new Date() },
      }
    );

    res.status(200).json({
      success: true,
      message: `Settlement rejected. ₹${txn.amount.toLocaleString('en-IN')} returned to agent wallet`,
    });
  } catch (error) {
    console.error('Admin Reject Settlement Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/admin/transactions
// @desc    Get all transactions (global ledger)
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────
export const adminGetTransactions = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    // We fetch raw first to allow search filtering manually if searching by populated fields,
    // or we can just fetch all and filter client side if the dataset isn't huge.
    // For now we'll do standard find and let frontend search (like it does currently)
    // to match the prompt requirements.

    const transactions = await Transaction.find(filter)
      .populate('ownerId', 'fullName userId agentId')
      .sort({ createdAt: -1 })
      .limit(200); // Reasonable limit for admin view

    // Calculate Summary Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [creditAgg, debitAgg, pendingCount, todayCount] = await Promise.all([
      Transaction.aggregate([{ $match: { type: 'credit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { type: 'debit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
    ]);

    const formatted = transactions.map(t => {
      let refStr = 'Unknown';
      let userStr = 'Unknown';
      if (t.ownerId) {
        userStr = t.ownerId.fullName;
        refStr = t.ownerId.userId || t.ownerId.agentId || 'Unknown';
      }

      return {
        id: t.transactionId,
        date: new Date(t.createdAt).toLocaleString('en-IN', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }),
        type: t.type === 'credit' ? 'Credit' : 'Debit',
        category: t.category,
        user: userStr,
        ref: refStr,
        amount: t.amount,
        status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
      stats: {
        totalCredit: creditAgg[0]?.total || 0,
        totalDebit: debitAgg[0]?.total || 0,
        pendingCount,
        todayCount,
      }
    });

  } catch (error) {
    console.error('Admin Get Transactions Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
