import express from 'express';
import { adminGetAllKYC, adminUpdateKYC } from '../controllers/kyc.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin must be logged in
router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetAllKYC);
router.patch('/:id', adminUpdateKYC);

export default router;
