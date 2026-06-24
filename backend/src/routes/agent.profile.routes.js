import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getProfile, updateProfile, getDashboardStats } from '../controllers/agent.profile.controller.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('agent'));

router.get('/', getProfile);
router.patch('/', updateProfile);
router.get('/dashboard', getDashboardStats);

export default router;
