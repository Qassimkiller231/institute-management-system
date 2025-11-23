import express from 'express';
import * as attendanceWarningController from '../controllers/attendanceWarning.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.use(authenticate);

router.post('/check-and-send', requireAdmin, attendanceWarningController.checkAndSendWarnings);
router.post('/manual', requireAdmin, attendanceWarningController.sendManualWarning);
router.get('/at-risk', requireTeacherOrAdmin, attendanceWarningController.getAtRiskStudents);

export default router;