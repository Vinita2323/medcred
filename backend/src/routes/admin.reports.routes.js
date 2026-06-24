import express from 'express';
import { adminGetReports } from '../controllers/admin.reports.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetReports);

export default router;
