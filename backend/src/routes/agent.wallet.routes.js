import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import {
  getAgentWallet,
  getWalletTransactions,
  requestWithdrawal,
} from '../controllers/agent.wallet.controller.js';

router.use(protect);
router.use(restrictTo('agent'));

router.get('/', getAgentWallet);
router.get('/transactions', getWalletTransactions);
router.post('/withdraw', requestWithdrawal);

export default router;
