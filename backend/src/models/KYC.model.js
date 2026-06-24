import mongoose from 'mongoose';

const KYCSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userType: {
      type: String,
      enum: ['user', 'agent'],
      default: 'user',
    },
    aadhaarNumber: {
      type: String,
      required: true,
    },
    kycReferenceId: {
      type: String,
      unique: true,
    },
    pan: {
      type: String,
    },
    isPanLinked: {
      type: Boolean,
      default: false,
    },
    selfieUrl: {
      type: String,
    },
    aadhaarFrontUrl: {
      type: String,
    },
    aadhaarBackUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate kycReferenceId
KYCSchema.pre('save', function () {
  if (!this.kycReferenceId) {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.kycReferenceId = `KYC${timestamp}${randomStr}`;
  }
});

const KYC = mongoose.model('KYC', KYCSchema);

export default KYC;
