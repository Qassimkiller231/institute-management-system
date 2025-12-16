import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import * as faqController from '../controllers/faq.controller';

const router = Router();

// All FAQ routes require admin authentication
router.post('/', authenticate, requireAdmin, faqController.createFAQ);
router.get('/', authenticate, requireAdmin, faqController.getAllFAQs);
router.get('/:id', authenticate, requireAdmin, faqController.getFAQById);
router.put('/:id', authenticate, requireAdmin, faqController.updateFAQ);
router.delete('/:id', authenticate, requireAdmin, faqController.deleteFAQ);

export default router;
