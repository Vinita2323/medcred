import express from 'express';
import { createTicket, getMyTickets } from '../controllers/support.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes: /api/v1/support
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getMyTickets);

export default router;
