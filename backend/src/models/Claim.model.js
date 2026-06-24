import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    // ── Auto-generated Claim ID ────────────────────────────────
    claimId: {
      type: String,
      unique: true,
      index: true,
    },

    // ── References ─────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },

    // ── Claim Details ──────────────────────────────────────────
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    claimAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    claimType: {
      type: String,
      enum: ['medical_services', 'emergency', 'diagnostic', 'pharmacy'],
      default: 'medical_services',
    },
    description: {
      type: String,
      trim: true,
    },

    // ── Documents (uploaded file URLs) ─────────────────────────
    documents: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    // ── Admin Review ──────────────────────────────────────────
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedAt: Date,

    // ── Timestamps ─────────────────────────────────────────────
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Auto-generate claimId before save ─────────────────────────
claimSchema.pre('save', async function () {
  if (!this.claimId) {
    const count = await mongoose.model('Claim').countDocuments();
    this.claimId = `MC-${String(count + 1000 + 1).slice(-4)}`;
  }
});

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
