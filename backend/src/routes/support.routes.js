import express from 'express';
import { createTicket, getMyTickets } from '../controllers/support.controller.js';
import { userSendMessage, userGetChatHistory } from '../controllers/chat.controller.js';
import { getFAQs } from '../controllers/faq.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tickets: /api/v1/support/tickets
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getMyTickets);

// Chat: /api/v1/support/chat
router.post('/chat/send', protect, userSendMessage);
router.get('/chat/history', protect, userGetChatHistory);

// FAQs: /api/v1/support/faqs
router.get('/faqs', getFAQs);

export default router;
