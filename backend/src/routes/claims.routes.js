import express from 'express';
import { submitClaim, getMyClaims } from '../controllers/claim.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('user'));

router.post('/submit', upload.array('documents', 5), submitClaim);
router.get('/my-claims', getMyClaims);

export default router;
