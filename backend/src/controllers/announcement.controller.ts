import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as announcementService from '../services/announcement.service';

/**
 * POST /api/announcements
 * Create announcement (Teacher or Admin)
 */
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, termId, title, content, targetAudience, scheduledFor, publishNow } = req.body;
    
    if (!title || !content || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and target audience are required'
      });
    }
    
    const announcement = await announcementService.createAnnouncement({
      groupId,
      termId,
      title,
      content,
      targetAudience,
      publishedBy: req.user!.userId,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      publishNow
    });
    
    res.status(201).json({
      success: true,
      message: publishNow ? 'Announcement published successfully' : 'Announcement scheduled successfully',
      data: announcement
    });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create announcement'
    });
  }
};

/**
 * GET /api/announcements
 * Get all announcements with filters
 */
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      groupId: req.query.groupId as string,
      termId: req.query.termId as string,
      isPublished: req.query.isPublished === 'true' ? true : 
                   req.query.isPublished === 'false' ? false : undefined,
      targetAudience: req.query.targetAudience as string,
      userId: req.user!.userId,
      userRole: req.user!.role,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };
    
    const result = await announcementService.getAnnouncements(filters);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch announcements'
    });
  }
};

/**
 * GET /api/announcements/:id
 * Get announcement by ID
 */
export const getAnnouncementById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const announcement = await announcementService.getAnnouncementById(id);
    
    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error: any) {
    console.error('Get announcement error:', error);
    
    if (error.message === 'Announcement not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch announcement'
    });
  }
};

/**
 * PUT /api/announcements/:id
 * Update announcement (Teacher or Admin)
 */
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const announcement = await announcementService.updateAnnouncement(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    
    if (error.message === 'Announcement not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update announcement'
    });
  }
};

/**
 * DELETE /api/announcements/:id
 * Delete announcement (Teacher or Admin)
 */
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await announcementService.deleteAnnouncement(id);
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    
    if (error.message === 'Announcement not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete announcement'
    });
  }
};

/**
 * POST /api/announcements/publish-scheduled
 * Manually trigger publishing of scheduled announcements (Admin only)
 */
export const publishScheduled = async (req: AuthRequest, res: Response) => {
  try {
    const count = await announcementService.publishScheduledAnnouncements();
    
    res.status(200).json({
      success: true,
      message: `${count} announcement(s) published`,
      publishedCount: count
    });
  } catch (error: any) {
    console.error('Publish scheduled error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish scheduled announcements'
    });
  }
};