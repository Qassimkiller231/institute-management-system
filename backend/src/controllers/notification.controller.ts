import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as notificationService from '../services/notification.service';

/**
 * GET /api/notifications
 * Get current user's notifications
 */
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 50;
    const result = await notificationService.getUserNotifications(userId, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await notificationService.markAsRead(notificationId, userId);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark ALL notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await notificationService.markAllAsRead(userId);

    res.json({ success: true, message: 'All marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};