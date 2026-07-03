import express from 'express';
import { getMyCard } from '../controllers/card.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('user', 'admin'));

router.get('/my-card', getMyCard);

export default router;
