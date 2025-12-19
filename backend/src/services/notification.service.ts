import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDto {
    userId: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string; // Optional link to the relevant page (e.g. /admin/students/123)
    sentVia?: string; // APP, EMAIL, SMS
}

/**
 * Create a single notification
 */
export const createNotification = async (data: CreateNotificationDto) => {
    return await prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            linkUrl: data.linkUrl,
            sentVia: data.sentVia || 'APP',
            isRead: false
        }
    });
};

/**
 * Bulk create notifications (e.g. for all students in a group)
 */
export const createBulkNotifications = async (notifications: CreateNotificationDto[]) => {
    if (notifications.length === 0) return;

    // Prisma createMany is faster
    return await prisma.notification.createMany({
        data: notifications.map(n => ({
            userId: n.userId,
            type: n.type,
            title: n.title,
            message: n.message,
            linkUrl: n.linkUrl,
            sentVia: n.sentVia || 'APP',
            isRead: false
        }))
    });
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId: string, limit = 50, offset = 0) => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });

    const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
    });

    return { notifications, unreadCount };
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string, userId: string) => {
    // Verify ownership first
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
        throw new Error('Notification not found or access denied');
    }

    return await prisma.notification.update({
        where: { id: notificationId },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
};

/**
 * Mark ALL notifications as read for a user
 */
export const markAllAsRead = async (userId: string) => {
    return await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
};

/**
 * Delete old notifications (Cleanup task)
 */
export const deleteOldNotifications = async (days = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await prisma.notification.deleteMany({
        where: {
            createdAt: { lt: date },
            isRead: true // Only delete read ones? Or all? Usually just read ones or really old ones.
        }
    });
};
