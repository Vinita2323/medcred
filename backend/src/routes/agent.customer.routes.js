import express from 'express';
const router = express.Router();
import {
  getAgentCustomers,
  onboardCustomer,
} from '../controllers/agent.customer.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

// Apply protect and restrictTo middleware to all routes in this file
router.use(protect);
router.use(restrictTo('agent'));

// GET /api/v1/agent/customers
router.get('/', getAgentCustomers);

// POST /api/v1/agent/customers/onboard
router.post(
  '/onboard',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 }
  ]),
  onboardCustomer
);

export default router;
