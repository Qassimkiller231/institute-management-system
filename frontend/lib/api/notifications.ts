import { API_URL, getHeaders } from './client';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationAPI = {
    getMyNotifications: async (limit = 50) => {
        const res = await fetch(`${API_URL}/notifications?limit=${limit}`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
    },

    markAsRead: async (id: string) => {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to mark notification as read');
        return res.json();
    },

    markAllAsRead: async () => {
        const res = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to mark all notifications as read');
        return res.json();
    }
};
