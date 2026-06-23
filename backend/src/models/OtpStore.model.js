import mongoose from 'mongoose';

const otpStoreSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'forgot_password', 'aadhaar_verify', 'agent_forgot_password'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpStoreSchema.index({ mobile: 1, purpose: 1 });

const OtpStore = mongoose.model('OtpStore', otpStoreSchema);
export default OtpStore;
