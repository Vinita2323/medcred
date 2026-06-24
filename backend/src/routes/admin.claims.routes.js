import express from 'express';
import { adminGetAllClaims, adminUpdateClaim } from '../controllers/claim.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetAllClaims);
router.patch('/:id', adminUpdateClaim);

export default router;
