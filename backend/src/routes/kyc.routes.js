import express from 'express';
import { submitKYC, getKYCStatus } from '../controllers/kyc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// User must be logged in
router.use(protect);

router.post('/submit', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 }
]), submitKYC);
router.get('/status', getKYCStatus);

export default router;
