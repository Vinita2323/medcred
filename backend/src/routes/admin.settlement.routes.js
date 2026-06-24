import express from 'express';
import {
  adminGetSettlements,
  adminApproveSettlement,
  adminRejectSettlement,
} from '../controllers/admin.settlement.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetSettlements);
router.patch('/:txnId/approve', adminApproveSettlement);
router.patch('/:txnId/reject', adminRejectSettlement);

export default router;
