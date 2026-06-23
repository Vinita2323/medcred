import express from 'express';
const router = express.Router();
import { adminLogin } from '../controllers/admin.auth.controller.js';

// POST /api/v1/admin/auth/login
router.post('/login', adminLogin);

export default router;
