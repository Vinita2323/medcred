import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import {
  adminGetLoans,
  adminUpdateLoan,
} from '../controllers/loan.controller.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/', adminGetLoans);
router.patch('/:id', adminUpdateLoan);

export default router;
