import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { getProfile, updateProfile, getUserDashboardStats } from '../controllers/user.profile.controller.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('user', 'admin'));

router.get('/', getProfile);
router.patch('/', upload.single('profilePhoto'), updateProfile);
router.get('/dashboard/stats', getUserDashboardStats);

export default router;
