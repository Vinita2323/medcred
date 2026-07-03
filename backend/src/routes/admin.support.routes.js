import express from 'express';
import { adminGetAllTickets, adminUpdateTicket } from '../controllers/support.controller.js';
import { adminSendMessage, adminGetChatHistory, adminGetChatUsers } from '../controllers/chat.controller.js';
import { createFAQ, updateFAQ, deleteFAQ } from '../controllers/faq.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin must be logged in
router.use(protect, restrictTo('admin', 'super_admin'));

// Tickets
router.get('/tickets', adminGetAllTickets);
router.patch('/tickets/:id', adminUpdateTicket);

// Chat
router.get('/chat/users', adminGetChatUsers);
router.get('/chat/history/:userId', adminGetChatHistory);
router.post('/chat/send', adminSendMessage);

// FAQ Management
router.post('/faqs', createFAQ);
router.patch('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

export default router;
