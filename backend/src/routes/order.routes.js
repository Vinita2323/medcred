import express from 'express';
import { createOrder, confirmPayment, createProductOrder, verifyProductPayment, getMyOrders } from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Membership card orders — user only (cards are tied to a user account)
router.post('/create',               restrictTo('user', 'admin'), createOrder);
router.post('/:orderId/confirm',     restrictTo('user', 'admin'), confirmPayment);
router.get('/my-orders',             restrictTo('user', 'admin'), getMyOrders);

// Product orders — allow user AND admin (so admin can test purchases too)
router.post('/product',              restrictTo('user', 'admin'), createProductOrder);
router.post('/product/verify',       restrictTo('user', 'admin'), verifyProductPayment);

export default router;
