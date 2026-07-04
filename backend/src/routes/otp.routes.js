import express from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  resendOtpHandler
} from '../controllers/otp.controller.js';

const router = express.Router();

// POST /api/auth/send-otp
router.post('/send-otp', sendOtpHandler);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);

// POST /api/auth/resend-otp
router.post('/resend-otp', resendOtpHandler);

export default router;
