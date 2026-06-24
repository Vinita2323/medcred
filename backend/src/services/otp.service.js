import OtpStore from '../models/OtpStore.model.js';

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to DB (10 min expiry)
export const saveOtp = async (mobile, purpose) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpStore.deleteOne({ mobile, purpose });
  await OtpStore.create({ mobile, otp, purpose, expiresAt });

  console.log(`\n📱 OTP for ${mobile} [${purpose}]: ${otp}\n`);
  return otp;
};

// Verify OTP
export const verifyOtp = async (mobile, otp, purpose) => {
  const record = await OtpStore.findOne({ mobile, purpose });

  if (!record) return { valid: false, message: 'OTP not found or already used' };
  if (record.isUsed) return { valid: false, message: 'OTP already used' };
  if (new Date() > record.expiresAt) {
    await OtpStore.deleteOne({ _id: record._id });
    return { valid: false, message: 'OTP expired. Please request a new one' };
  }
  if (record.attempts >= 3) return { valid: false, message: 'Too many wrong attempts. Request a new OTP' };
  
  if (record.otp !== otp) {
    await OtpStore.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { valid: false, message: 'Invalid OTP' };
  }

  await OtpStore.updateOne({ _id: record._id }, { isUsed: true });
  return { valid: true };
};
