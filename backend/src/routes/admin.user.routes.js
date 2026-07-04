import express from 'express';
import { adminGetAllUsers, adminDashboardStats, adminUpdateUserStatus, adminActivateCard, adminGetUserDetails, adminVerifyUserKYC, adminToggleLoanBypass } from '../controllers/admin.user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/dashboard/stats', adminDashboardStats);
router.patch('/:id/status', adminUpdateUserStatus);
router.patch('/:id/activate-card', adminActivateCard);
router.patch('/:id/verify-kyc', adminVerifyUserKYC);
router.patch('/:id/toggle-loan-bypass', adminToggleLoanBypass);
router.get('/:id/details', adminGetUserDetails);
router.get('/', adminGetAllUsers);

export default router;
