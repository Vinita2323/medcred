import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const agentSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────────
    agentId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    // AgentAdminPage line 52: uses a.mobileNumber (NOT mobile)
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    // ── Role & Hierarchy ───────────────────────────────────────
    role: {
      type: String,
      enum: ['Admin', 'Super Agent', 'Agent', 'Field Agent'],
      default: 'Field Agent',
    },
    reportingManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    reportingManagerName: String,

    // ── KYC Documents ─────────────────────────────────────────
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    aadhaarFrontUrl: String,
    aadhaarBackUrl: String,
    profilePhotoUrl: String,

    // ── Registration ──────────────────────────────────────────
    referralCodeUsed: String,

    // ── Status — AgentLoginPage checks this (line 130-137) ────
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Blocked', 'Rejected'],
      default: 'Pending Approval',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    approvedAt: Date,
    joiningDate: Date,

    // ── Performance ───────────────────────────────────────────
    salesCount: { type: Number, default: 0 },
    totalRegistrations: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0 },
    rank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },

    // ── Earnings (AdminSettlementsPage) ───────────────────────
    earnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 },

    // ── Referral ──────────────────────────────────────────────
    referralCode: {
      type: String,
      unique: true,
    },

    // ── Wallet & FCM ──────────────────────────────────────────
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
    },
    fcmToken: String,

    // ── Tokens ─────────────────────────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Auto-generate agentId & referralCode ──────────────────────
agentSchema.pre('save', async function () {
  if (!this.agentId) {
    const count = await mongoose.model('Agent').countDocuments();
    this.agentId = `MC-${String(9000 + count + 1)}`;
  }
  if (!this.referralCode) {
    this.referralCode = `AGENT${Math.floor(10 + Math.random() * 90)}`;
  }

  // Hash password
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password ──────────────────────────────────────────
agentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Indexes ───────────────────────────────────────────────────
agentSchema.index({ status: 1 });

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
