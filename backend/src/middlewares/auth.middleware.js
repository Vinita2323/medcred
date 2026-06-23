import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Agent from '../models/Agent.model.js';
import Admin from '../models/Admin.model.js';

// ── Protect Route — JWT Verify ─────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role in token
    let currentUser;
    if (decoded.role === 'user') {
      currentUser = await User.findById(decoded.id);
    } else if (decoded.role === 'agent') {
      currentUser = await Agent.findById(decoded.id);
    } else if (decoded.role === 'admin') {
      currentUser = await Admin.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // Block suspended/blocked users
    if (currentUser.status === 'blocked' || currentUser.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact support.',
      });
    }

    req.user = currentUser;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Role-based Access Control ──────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

export { protect, restrictTo };
