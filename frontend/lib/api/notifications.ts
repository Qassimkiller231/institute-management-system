import { apiFetch } from './client';

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
    getMyNotifications: (limit = 50) =>
        apiFetch(`/notifications?limit=${limit}`),

    markAsRead: (id: string) =>
        apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),

    markAllAsRead: () =>
        apiFetch('/notifications/read-all', { method: 'PUT' }),
};
