import express from 'express';
import { adminVerifyMember, adminGetMembers } from '../controllers/family.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply admin auth middleware
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', adminGetMembers);
router.patch('/:id/verify', adminVerifyMember);

export default router;
