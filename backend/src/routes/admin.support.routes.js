import express from 'express';
import { adminGetAllTickets, adminUpdateTicket } from '../controllers/support.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin must be logged in
router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/tickets', adminGetAllTickets);
router.patch('/tickets/:id', adminUpdateTicket);

export default router;
