import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
  checkEligibility,
  applyLoan,
  getMyLoan,
  getLoanHistory,
  getLoanById,
} from '../controllers/loan.controller.js';

const router = express.Router();

router.use(protect);

router.get('/eligibility', checkEligibility);
router.post('/apply', upload.any(), applyLoan);
router.get('/my-loan', getMyLoan);
router.get('/history', getLoanHistory);
router.get('/:id', getLoanById);

export default router;
