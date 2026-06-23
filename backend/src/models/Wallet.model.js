import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    // Owner can be User or Agent
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

    // ── USER Wallet ─────────────────────────────────────────
    availableBalance: { type: Number, default: 0 },
    claimCredits: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },

    // ── AGENT Wallet ────────────────────────────────────────
    totalEarnings: { type: Number, default: 0 },
    withdrawableBalance: { type: Number, default: 0 },
    pendingCommissions: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 },

    currency: {
      type: String,
      default: 'INR',
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
