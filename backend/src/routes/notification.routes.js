import express from 'express';
import { saveFCMToken, testPushNotification } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Update FCM token for authenticated user (User, Agent, or Admin)
router.post('/fcm-token', protect, saveFCMToken);

// Test endpoint to send a push notification to the current user
router.post('/test', protect, testPushNotification);

export default router;
