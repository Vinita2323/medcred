import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Agent from '../models/Agent.model.js';
import Admin from '../models/Admin.model.js';
import { generateAccessToken } from '../utils/generateToken.js';

// Helper to find token across collections
const findUserByRefreshToken = async (refreshToken) => {
  let user = await User.findOne({ refreshToken });
  let role = 'user';
  
  if (!user) {
    user = await Agent.findOne({ refreshToken });
    role = 'agent';
  }
  
  if (!user) {
    user = await Admin.findOne({ refreshToken });
    role = 'admin';
  }
  
  return { user, role };
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/refresh
// @desc    Get new access token using refresh token
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    // Verify token structure and expiration
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find the user/agent/admin in DB that has this exact refresh token
    const { user, role } = await findUserByRefreshToken(refreshToken);

    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // Generate new Access Token
    const payload = { id: user._id, role };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    // If JWT expires or is invalid
    return res.status(403).json({ success: false, message: 'Refresh token expired or invalid. Please login again.' });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/logout
// @desc    Logout user/agent/admin by clearing DB refresh token
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const logoutHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const { user } = await findUserByRefreshToken(refreshToken);
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};
