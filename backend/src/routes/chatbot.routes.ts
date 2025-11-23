import express from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin);

// Send message to chatbot (ADMIN ONLY)
router.post('/query', chatbotController.sendMessage);

// Get chat history (ADMIN ONLY)
router.get('/history', chatbotController.getChatHistory);

// Get weekly summary (ADMIN ONLY)
router.get('/summary/weekly', chatbotController.getWeeklySummary);

// Get FAQs (ADMIN ONLY)
router.get('/faqs', chatbotController.getFAQs);

// Clear chat history (ADMIN ONLY)
router.delete('/history', chatbotController.clearHistory);

export default router;