import Admin from '../models/Admin.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/admin/auth/login
// @desc    Admin login with email + password
// @access  Public
// ─────────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if active
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account is deactivated.' });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate Tokens
    const payload = { id: admin._id, role: 'admin' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    admin.refreshToken = refreshToken;
    admin.lastLoginAt = new Date();
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        accessToken,
        refreshToken,
        admin: {
          adminId: admin.adminId,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

export { adminLogin };
