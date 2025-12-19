import { Router } from 'express';
import { backupController } from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All backup routes require ADMIN role
router.use(authenticate, authorize(['ADMIN']));

// Configuration Routes
router.get('/config', backupController.getConfig);
router.put('/config', backupController.updateConfig);

// Operation Routes
router.post('/', backupController.createBackup);
router.get('/', backupController.listBackups);
router.get('/:filename/download', backupController.downloadBackup);
router.post('/:filename/restore', backupController.restoreBackup);
router.delete('/:filename', backupController.deleteBackup);

export default router;
