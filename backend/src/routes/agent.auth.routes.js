import express from 'express';
import {
  agentRegister,
  agentLogin,
  agentVerifyOtp,
  agentSendOtp,
  forgotPassword,
  resetPassword,
  validateJoinCode
} from '../controllers/agent.auth.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// GET /api/v1/agent/auth/validate-join-code/:code
router.get('/validate-join-code/:code', validateJoinCode);

// POST /api/v1/agent/auth/register
router.post(
  '/register',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'chequePassbook', maxCount: 1 },
  ]),
  agentRegister
);

// POST /api/v1/agent/auth/login
router.post('/login', agentLogin);

// POST /api/v1/agent/auth/send-otp
router.post('/send-otp', agentSendOtp);

// POST /api/v1/agent/auth/verify-otp
router.post('/verify-otp', agentVerifyOtp);

// POST /api/v1/agent/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/v1/agent/auth/reset-password
router.post('/reset-password', resetPassword);

export default router;
