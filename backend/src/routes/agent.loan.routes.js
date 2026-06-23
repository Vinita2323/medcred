import express from 'express';
const router = express.Router();
import { agentApplyLoanForCustomer } from '../controllers/agent.loan.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

router.use(protect);
router.use(restrictTo('agent'));

// POST /api/v1/agent/loans/apply
router.post('/apply', upload.any(), agentApplyLoanForCustomer);

export default router;
