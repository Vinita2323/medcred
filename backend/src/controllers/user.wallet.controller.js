import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/user/wallet
// @desc    Get user's wallet balance
// @access  Private (User)
// ─────────────────────────────────────────────────────────────────
export const getUserWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ ownerId: req.user._id, ownerType: 'User' });

    // If no wallet exists, create an empty one
    if (!wallet) {
      wallet = await Wallet.create({
        ownerId: req.user._id,
        ownerType: 'User',
        availableBalance: 0,
        claimCredits: 0,
        refunds: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error('getUserWallet Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/v1/user/wallet/transactions
// @desc    Get user's wallet transaction history
// @access  Private (User)
// ─────────────────────────────────────────────────────────────────
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      ownerId: req.user._id,
      ownerType: 'User',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('getUserTransactions Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/user/wallet/topup
// @desc    Add money to user wallet
// @access  Private (User)
// ─────────────────────────────────────────────────────────────────
export const topUpUserWallet = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount.' });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ ownerId: req.user._id, ownerType: 'User' });
    if (!wallet) {
      wallet = await Wallet.create({
        ownerId: req.user._id,
        ownerType: 'User',
        availableBalance: 0,
      });
    }

    // In a real scenario, this would happen AFTER a successful Razorpay webhook
    // For now, we simulate a successful payment

    // Create transaction record
    const transaction = await Transaction.create({
      walletId: wallet._id,
      ownerId: req.user._id,
      ownerType: 'User',
      type: 'credit',
      category: 'wallet_topup',
      amount: amount,
      sourceDescription: `Top up via ${paymentMethod || 'UPI'}`,
      status: 'completed',
    });

    // Update wallet balance
    wallet.availableBalance += amount;
    wallet.lastUpdatedAt = Date.now();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: `Successfully added ₹${amount} to your wallet.`,
      data: {
        wallet,
        transaction,
      },
    });
  } catch (error) {
    console.error('topUpUserWallet Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
