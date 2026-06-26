import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    userId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mobile: {
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password in queries
    },
    profilePhoto: {
      type: String,
      default: null,
    },

    // ── Personal Info (RegisterPage formData) ─────────────────
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', null],
      default: null,
    },
    occupation: String,
    annualIncome: Number,

    // ── Aadhaar / KYC ─────────────────────────────────────────
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    aadhaarFrontUrl: {
      type: String,
      default: null,
    },
    aadhaarBackUrl: {
      type: String,
      default: null,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not_submitted'],
      default: 'not_submitted',
    },
    kycRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KYC',
    },
    aadhaarVerifiedAt: Date,

    // ── Health Info (ProfilePage) ──────────────────────────────
    health: {
      height: String,
      weight: String,
      bloodGroup: String,
      allergies: String,
      chronic: String,
      medications: String,
    },

    // ── Account Status ─────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended', 'deleted'],
      default: 'active',
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentGivenAt: Date,

    // ── Relationships ──────────────────────────────────────────
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      default: null,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    referralCode: String,

    // ── Health Score (ProfilePage) ─────────────────────────────
    healthScore: {
      score: { type: Number, default: 0 },
      tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze',
      },
      lastCalculatedAt: Date,
    },

    // ── Push Notification Token ────────────────────────────────
    fcmToken: String,

    // ── Timestamps ─────────────────────────────────────────────
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: Date,

    // ── Tokens ─────────────────────────────────────────────────
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Auto-generate userId before save ──────────────────────────
userSchema.pre('save', async function () {
  // Generate userId
  if (!this.userId) {
    const count = await mongoose.model('User').countDocuments();
    this.userId = `USR${String(count + 1).padStart(3, '0')}`;
  }

  // Hash password if modified
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password method ────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Indexes ────────────────────────────────────────────────────
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);
export default User;
