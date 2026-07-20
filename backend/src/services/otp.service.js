import OtpStore from '../models/OtpStore.model.js';
import User from '../models/User.model.js';
import { sendSmsViaIndiaHub } from '../utils/smsSender.js';

// Generate a random 6-digit numeric OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to DB and send SMS
export const saveOtp = async (mobile, purpose) => {
  // Sanitize mobile
  let cleanedMobile = mobile.replace(/\D/g, '');
  if (cleanedMobile.startsWith('91') && cleanedMobile.length === 12) {
    cleanedMobile = cleanedMobile.substring(2);
  } else if (cleanedMobile.startsWith('0') && cleanedMobile.length === 11) {
    cleanedMobile = cleanedMobile.substring(1);
  }

  // Validate Indian mobile number format
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(cleanedMobile)) {
    throw new Error('Invalid Indian mobile number. Must be exactly 10 digits and start with 6-9.');
  }

  mobile = cleanedMobile;

  // Delete any expired OTPs for this mobile number first
  await OtpStore.deleteMany({ mobile, expiresAt: { $lt: new Date() } });

  const now = new Date();
  const resendSeconds = parseInt(process.env.OTP_RESEND_SECONDS || '30', 10);
  const cutoffTime = new Date(Date.now() - resendSeconds * 1000);

  let otp = generateOtp();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Try to atomically update the record ONLY if it hasn't been updated in the last 30 seconds
  const updatedRecord = await OtpStore.findOneAndUpdate(
    { 
      mobile, 
      purpose,
      lastSentAt: { $lte: cutoffTime },
      sendCount: { $lt: 5 }
    },
    {
      $set: {
        otp: otp,
        expiresAt: expiresAt,
        attempts: 0,
        isUsed: false,
        lastSentAt: now
      },
      $inc: { sendCount: 1 }
    },
    { new: true }
  );

  if (!updatedRecord) {
    // If update failed, check why (it either doesn't exist, is on cooldown, or hit max attempts)
    const existingRecord = await OtpStore.findOne({ mobile, purpose });
    
    if (existingRecord) {
      if (existingRecord.sendCount >= 5) {
        throw new Error('Maximum OTP resend attempts reached (5). Please try again later.');
      }
      
      const secondsSinceLastSent = (now - new Date(existingRecord.lastSentAt)) / 1000;
      if (secondsSinceLastSent < resendSeconds) {
        throw new Error(`Please wait ${Math.ceil(resendSeconds - secondsSinceLastSent)} seconds before requesting a new OTP.`);
      }

      // Edge case fallback
      throw new Error(`Please wait ${resendSeconds} seconds before requesting a new OTP.`);
    } else {
      // Record doesn't exist, create safely
      try {
        await OtpStore.create({
          mobile,
          otp,
          purpose,
          expiresAt,
          attempts: 0,
          isUsed: false,
          sendCount: 1,
          lastSentAt: now
        });
      } catch (err) {
        // If two requests try to create simultaneously and unique index catches it
        if (err.code === 11000) {
          throw new Error(`Please wait ${resendSeconds} seconds before requesting a new OTP.`);
        }
        throw err;
      }
    }
  }

  // Send SMS using SMS India Hub API
  const appName = process.env.APP_NAME || 'MedCred';
  const message = `Welcome to ${appName}. Your OTP for registration is ${otp}.BGADEC`;
  
  const smsResult = await sendSmsViaIndiaHub(mobile, message);
  if (!smsResult.success) {
    console.error(`[OTP Service] SMS delivery failed for ${mobile}: ${smsResult.error}`);
  }

  // Always log in console for development/debugging ease
  console.log(`\n📱 OTP for ${mobile} [${purpose}]: ${otp}\n`);

  return otp;
};

// Verify OTP
export const verifyOtp = async (mobile, otp, purpose) => {
  // Sanitize mobile
  let cleanedMobile = mobile.replace(/\D/g, '');
  if (cleanedMobile.startsWith('91') && cleanedMobile.length === 12) {
    cleanedMobile = cleanedMobile.substring(2);
  } else if (cleanedMobile.startsWith('0') && cleanedMobile.length === 11) {
    cleanedMobile = cleanedMobile.substring(1);
  }
  mobile = cleanedMobile;

  // Clear expired OTPs
  await OtpStore.deleteMany({ mobile, expiresAt: { $lt: new Date() } });

  const record = await OtpStore.findOne({ mobile, purpose });

  if (!record) {
    return { valid: false, message: 'OTP not found or already used.' };
  }

  if (record.isUsed) {
    return { valid: false, message: 'OTP already used.' };
  }

  if (new Date() > record.expiresAt) {
    await OtpStore.deleteOne({ _id: record._id });
    return { valid: false, message: 'OTP expired. Please request a new one.' };
  }

  // Enforce maximum 5 verification attempts
  if (record.attempts >= 5) {
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    return { valid: false, message: `Invalid OTP. ${5 - record.attempts} attempts remaining.` };
  }

  // Mark OTP as used (keep in DB for 5 minutes as proof of verification)
  record.isUsed = true;
  record.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await record.save();

  // Mark user as verified in database if they exist
  await User.updateOne(
    { mobile },
    { isMobileVerified: true, isVerified: true }
  );

  return { valid: true };
};
