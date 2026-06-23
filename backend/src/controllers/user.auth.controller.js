import User from '../models/User.model.js';
import { saveOtp, verifyOtp } from '../services/otp.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @desc    Register new user + send OTP
// @access  Public
// ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, mobile, email, dob, gender, aadhaar, address, consent, password } = req.body;

    // Validate required fields
    if (!name || !mobile || !email || !dob || !gender || !aadhaar || !address || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    if (!consent) {
      return res.status(400).json({ success: false, message: 'Please agree to the verification terms' });
    }

    // Check duplicate mobile
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Handle profile photo if uploaded
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = `/uploads/${req.file.filename}`;
    }

    // Save user (unverified)
    const user = await User.create({
      fullName: name,
      mobile,
      email,
      password, // user provided password
      profilePhoto: profilePhotoPath,
      dob,
      gender,
      aadhaarNumber: aadhaar.replace(/\s/g, ''),
      address,
      consentGiven: consent,
      consentGivenAt: new Date(),
      isMobileVerified: false,
    });

    // Send OTP
    await saveOtp(mobile, 'register');

    res.status(201).json({
      success: true,
      message: 'OTP sent to your mobile number',
      data: { mobile },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/verify-otp
// @desc    Verify OTP after registration → return JWT
// @access  Public
// ─────────────────────────────────────────────────────────────────
const verifyOtpHandler = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    // Verify OTP
    const result = await verifyOtp(mobile, otp, 'register');
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { mobile },
      { isMobileVerified: true, isVerified: true, lastLoginAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate Tokens
    const payload = { id: user._id, role: 'user' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refreshToken to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Verification successful',
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
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/login
// @desc    Login with mobile + password → return JWT
// @access  Public
// ─────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile and password are required' });
    }

    // Find user with password field
    const user = await User.findOne({ mobile }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Check account status
    if (user.status === 'blocked' || user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is blocked. Contact support.' });
    }

    // Generate Tokens
    const payload = { id: user._id, role: 'user' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
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
        },
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/forgot-password
// @desc    Send OTP to mobile for password reset
// @access  Public
// ─────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this mobile number' });
    }

    await saveOtp(mobile, 'forgot_password');

    res.status(200).json({ success: true, message: 'OTP sent to your mobile number' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/reset-password
// @desc    Verify OTP + set new password
// @access  Public
// ─────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword, confirmPassword } = req.body;

    if (!mobile || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Verify OTP
    const result = await verifyOtp(mobile, otp, 'forgot_password');
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Update password
    const user = await User.findOne({ mobile }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/resend-otp
// @desc    Resend OTP (OtpPage resend button)
// @access  Public
// ─────────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { mobile, purpose } = req.body;

    if (!mobile || !purpose) {
      return res.status(400).json({ success: false, message: 'Mobile and purpose are required' });
    }

    await saveOtp(mobile, purpose);

    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/send-login-otp
// @desc    Send OTP for login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const sendLoginOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this mobile number' });
    if (user.status === 'blocked' || user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
    }

    await saveOtp(mobile, 'login');
    res.status(200).json({ success: true, message: 'Login OTP sent to your mobile' });
  } catch (error) {
    console.error('Send Login OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/verify-login-otp
// @desc    Verify OTP for login
// @access  Public
// ─────────────────────────────────────────────────────────────────
const verifyLoginOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });

    const result = await verifyOtp(mobile, otp, 'login');
    if (!result.valid) return res.status(400).json({ success: false, message: result.message });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const payload = { id: user._id, role: 'user' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
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
        },
      },
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

export { register, verifyOtpHandler, login, forgotPassword, resetPassword, resendOtp, sendLoginOtp, verifyLoginOtp };
