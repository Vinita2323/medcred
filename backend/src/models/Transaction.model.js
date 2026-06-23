import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ownerType',
    },
    ownerType: {
      type: String,
      required: true,
      enum: ['User', 'Agent'],
    },
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'card_purchase',
        'claim_payout',
        'refund',
        'agent_commission',
        'payout_settlement',
        'wallet_usage',
        'override_commission',
        'wallet_topup',
      ],
    },
    amount: {
      type: Number,
      required: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedEntityType: {
      type: String,
      enum: ['Claim', 'Order', 'Payout', 'User'],
    },
    sourceDescription: {
      type: String,
      required: true,
    },
    detailDescription: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

// Indexes
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ ownerId: 1, ownerType: 1 });

// Auto-generate transactionId
transactionSchema.pre('validate', async function () {
  if (!this.transactionId) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionId = `TX-${Date.now().toString().slice(-5)}${count}`;
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
