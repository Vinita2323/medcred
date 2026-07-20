import Transaction from '../models/Transaction.model.js';
import Wallet from '../models/Wallet.model.js';
import Agent from '../models/Agent.model.js';
import Notification from '../models/Notification.model.js';
import { sendPushNotification } from '../services/notification.service.js';

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
        bankDetails: t.ownerId?.bankDetails || null,
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
    const { bankTransactionId } = req.body;

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

    if (!bankTransactionId) {
      return res.status(400).json({ success: false, message: 'Bank Transaction ID is required to approve settlement.' });
    }

    // Update transaction status and store proof
    txn.status = 'completed';
    txn.detailDescription = `Payout Approved | Bank TXN: ${bankTransactionId}`;
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

    // Fire-and-forget push notification
    try {
      const agent = await Agent.findById(txn.ownerId);
      if (agent) {
        const title = 'Settlement Approved';
        const message = `Your settlement of ₹${txn.amount.toLocaleString('en-IN')} has been approved (TXN: ${bankTransactionId}).`;
        
        // Save Notification in DB
        await Notification.create({
          userId: agent._id,
          title,
          message,
          type: 'success',
          icon: 'account_balance_wallet',
        });

        // Send Push
        if (agent.fcmToken) {
          await sendPushNotification({
            token: agent.fcmToken,
            title,
            body: message,
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to send push notification on settlement approve:', notifErr);
    }
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

    // Fire-and-forget push notification
    try {
      const agent = await Agent.findById(txn.ownerId);
      if (agent) {
        const title = 'Settlement Rejected';
        const message = `Your settlement of ₹${txn.amount.toLocaleString('en-IN')} was rejected. Reason: ${rejectionReason}. Amount returned to wallet.`;
        
        // Save Notification in DB
        await Notification.create({
          userId: agent._id,
          title,
          message,
          type: 'error',
          icon: 'cancel',
        });

        // Send Push
        if (agent.fcmToken) {
          await sendPushNotification({
            token: agent.fcmToken,
            title,
            body: message,
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to send push notification on settlement reject:', notifErr);
    }
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
