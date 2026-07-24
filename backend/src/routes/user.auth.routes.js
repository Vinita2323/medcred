import express from 'express';
const router = express.Router();
import {
  register,
  verifyOtpHandler,
  login,
  forgotPassword,
  resetPassword,
  resendOtp,
  sendLoginOtp,
  verifyLoginOtp,
  checkOtpController,
} from '../controllers/user.auth.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

// POST /api/v1/auth/register
router.post(
  '/register',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 }
  ]),
  register
);

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/v1/auth/resend-otp
router.post('/resend-otp', resendOtp);

// POST /api/v1/auth/send-login-otp
router.post('/send-login-otp', sendLoginOtp);

// POST /api/v1/auth/verify-login-otp
router.post('/verify-login-otp', verifyLoginOtp);

// POST /api/v1/auth/check-otp
router.post('/check-otp', checkOtpController);

export default router;
