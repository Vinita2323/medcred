import express from 'express';
import { createOrder, confirmPayment, createProductOrder, getMyOrders } from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('user'));

router.post('/create', createOrder);
router.post('/product', createProductOrder);
router.post('/:orderId/confirm', confirmPayment);
router.get('/my-orders', getMyOrders);

export default router;
