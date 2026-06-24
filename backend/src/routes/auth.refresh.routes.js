import express from 'express';
const router = express.Router();
import { refreshTokenHandler, logoutHandler } from '../controllers/auth.refresh.controller.js';

// POST /api/v1/auth/refresh
router.post('/refresh', refreshTokenHandler);

// POST /api/v1/auth/logout
router.post('/logout', logoutHandler);

export default router;
