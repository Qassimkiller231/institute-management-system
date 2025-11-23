import express from 'express';
import * as announcementController from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all announcements (any authenticated user can view)
router.get('/', announcementController.getAnnouncements);

// Get specific announcement
router.get('/:id', announcementController.getAnnouncementById);

// Create announcement (Teacher or Admin)
router.post('/', requireTeacherOrAdmin, announcementController.createAnnouncement);

// Update announcement (Teacher or Admin)
router.put('/:id', requireTeacherOrAdmin, announcementController.updateAnnouncement);

// Delete announcement (Teacher or Admin)
router.delete('/:id', requireTeacherOrAdmin, announcementController.deleteAnnouncement);

// Publish scheduled announcements (Admin only)
router.post('/publish-scheduled', requireAdmin, announcementController.publishScheduled);

export default router;