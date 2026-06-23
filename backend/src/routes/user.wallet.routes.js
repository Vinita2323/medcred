import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import {
  getUserWallet,
  getUserTransactions,
  topUpUserWallet,
} from '../controllers/user.wallet.controller.js';

const router = express.Router();

// All routes require user authentication
router.use(protect);
router.use(restrictTo('user'));

router.get('/', getUserWallet);
router.get('/transactions', getUserTransactions);
router.post('/topup', topUpUserWallet);

export default router;
