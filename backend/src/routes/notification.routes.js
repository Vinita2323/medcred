import express from 'express';
import { saveFCMToken, testPushNotification, getUserNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/fcm-token', protect, saveFCMToken);
router.post('/test', protect, testPushNotification);
router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
