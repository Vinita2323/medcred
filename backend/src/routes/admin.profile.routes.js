import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getProfile, updateProfile } from '../controllers/admin.profile.controller.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getProfile);
router.patch('/', updateProfile);

export default router;
