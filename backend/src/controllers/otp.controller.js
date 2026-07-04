import User from '../models/User.model.js';
import { saveOtp, verifyOtp } from '../services/otp.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
export const sendOtpHandler = async (req, res) => {
  try {
    const { mobile, purpose = 'register' } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

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
      return res.status(400).json({ success: false, message: 'Invalid Indian mobile number. Must be exactly 10 digits.' });
    }

    // Generate and send OTP
    await saveOtp(cleanedMobile, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.'
    });
  } catch (error) {
    console.error('Send OTP Handler Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to send OTP.' });
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
export const verifyOtpHandler = async (req, res) => {
  try {
    const { mobile, otp, purpose = 'register' } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits.' });
    }

    // Sanitize mobile
    let cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.startsWith('91') && cleanedMobile.length === 12) {
      cleanedMobile = cleanedMobile.substring(2);
    } else if (cleanedMobile.startsWith('0') && cleanedMobile.length === 11) {
      cleanedMobile = cleanedMobile.substring(1);
    }

    // Verify OTP via service
    const result = await verifyOtp(cleanedMobile, otp, purpose);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Check if user is registered in the database
    const user = await User.findOne({ mobile: cleanedMobile });
    if (user) {
      // Check account status
      if (user.status === 'blocked' || user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
      }

      // Generate login tokens
      const payload = { id: user._id, role: 'user' };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        isRegistered: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            userId: user.userId,
            name: user.fullName,
            mobile: user.mobile,
            email: user.email,
            kycStatus: user.kycStatus,
            hasCard: !!user.cardId,
          }
        }
      });
    }

    // User is verified but not yet registered (middle of signup flow)
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      isRegistered: false
    });
  } catch (error) {
    console.error('Verify OTP Handler Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
export const resendOtpHandler = async (req, res) => {
  try {
    const { mobile, purpose = 'register' } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    // Sanitize mobile
    let cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.startsWith('91') && cleanedMobile.length === 12) {
      cleanedMobile = cleanedMobile.substring(2);
    } else if (cleanedMobile.startsWith('0') && cleanedMobile.length === 11) {
      cleanedMobile = cleanedMobile.substring(1);
    }

    // Validate mobile
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanedMobile)) {
      return res.status(400).json({ success: false, message: 'Invalid Indian mobile number. Must be exactly 10 digits.' });
    }

    // Call service to generate/resend new OTP (which handles time limit & attempts limit)
    await saveOtp(cleanedMobile, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.'
    });
  } catch (error) {
    console.error('Resend OTP Handler Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to resend OTP.' });
  }
};
