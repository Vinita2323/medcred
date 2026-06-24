import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import Agent from '../models/Agent.model.js';

// Helper to get or create wallet
const getOrCreateAgentWallet = async (agentId) => {
  let wallet = await Wallet.findOne({ ownerId: agentId, ownerType: 'Agent' });
  if (!wallet) {
    wallet = new Wallet({
      ownerId: agentId,
      ownerType: 'Agent',
      totalEarnings: 0,
      withdrawableBalance: 0,
      pendingCommissions: 0,
      paidEarnings: 0,
    });
    await wallet.save();
  }
  return wallet;
};

/**
 * @desc    Get agent wallet details
 * @route   GET /api/v1/agent/wallet
 * @access  Private (Agent)
 */
export const getAgentWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateAgentWallet(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: wallet.totalEarnings,
        withdrawableBalance: wallet.withdrawableBalance,
        pendingCommissions: wallet.pendingCommissions,
        paidEarnings: wallet.paidEarnings,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Error in getAgentWallet:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get wallet transactions
 * @route   GET /api/v1/agent/wallet/transactions
 * @access  Private (Agent)
 */
export const getWalletTransactions = async (req, res) => {
  try {
    const wallet = await getOrCreateAgentWallet(req.user._id);

    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 transactions

    // Format for frontend
    const formattedTransactions = transactions.map((t) => ({
      id: t.transactionId,
      date: t.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      client: t.sourceDescription,
      details: t.detailDescription,
      amount: t.amount,
      type: t.type,
      status: t.status === 'completed' ? 'Paid' : t.status === 'pending' ? 'Pending' : 'Failed',
    }));

    res.status(200).json({
      success: true,
      count: formattedTransactions.length,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error('Error in getWalletTransactions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Request withdrawal
 * @route   POST /api/v1/agent/wallet/withdraw
 * @access  Private (Agent)
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await getOrCreateAgentWallet(req.user._id);

    if (wallet.withdrawableBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient withdrawable balance' });
    }

    // Move from withdrawable to pending
    wallet.withdrawableBalance -= amount;
    wallet.pendingCommissions += amount;
    await wallet.save();

    // Create a pending transaction for the withdrawal
    const withdrawalTxn = new Transaction({
      walletId: wallet._id,
      ownerId: req.user._id,
      ownerType: 'Agent',
      type: 'debit',
      category: 'payout_settlement',
      amount: amount,
      sourceDescription: `${req.user.fullName} Withdrawal`,
      detailDescription: 'Payout Settlement Requested',
      status: 'pending',
    });
    await withdrawalTxn.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawableBalance: wallet.withdrawableBalance,
        pendingCommissions: wallet.pendingCommissions,
      },
    });
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
