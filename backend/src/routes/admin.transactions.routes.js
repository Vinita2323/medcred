import express from 'express';
import { adminGetTransactions } from '../controllers/admin.settlement.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetTransactions);

export default router;
