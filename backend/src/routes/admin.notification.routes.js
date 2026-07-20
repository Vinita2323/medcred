import express from 'express';
import {
  getAdminNotifications,
  getUnreadCount,
  markNotificationRead
} from '../controllers/admin.notification.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getAdminNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationRead);

export default router;
