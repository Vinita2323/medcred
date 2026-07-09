import express from 'express';
import {
  getAdminOrders,
  getAdminMembershipOrders,
  updateOrderStatus,
  getPendingOrdersCount
} from '../controllers/admin.order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);
router.use(restrictTo('admin'));

router.get('/pending-count', getPendingOrdersCount);
router.get('/memberships', getAdminMembershipOrders);
router.get('/', getAdminOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
