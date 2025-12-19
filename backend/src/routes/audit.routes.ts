import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Used for retrieving audit logs - Admin only
router.get('/', authenticate, authorize(['ADMIN']), auditController.getLogs);

// Optional stats endpoint
router.get('/stats', authenticate, authorize(['ADMIN']), auditController.getStats);

export default router;
