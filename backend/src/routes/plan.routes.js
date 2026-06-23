import express from 'express';
import { getPlans, getPlanById, adminUpdateSettings } from '../controllers/plan.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Both routes are public so users can view plans without logging in, 
// but can be protected later if needed.
router.get('/', getPlans);
router.patch('/settings', protect, restrictTo('admin', 'super_admin'), adminUpdateSettings);
router.get('/:id', getPlanById);

export default router;
