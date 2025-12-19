'use client';

import { useState, useEffect } from 'react';
import { notificationAPI, Notification } from '@/lib/api/notifications';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationAPI.getMyNotifications();
            if (res.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-gray-800">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 font-medium"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-50">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 italic">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">No notifications yet 🎉</div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${notification.type.includes('COMPLETION') ? 'bg-green-100 text-green-700' :
                                                notification.type.includes('WARNING') ? 'bg-red-100 text-red-700' :
                                                    notification.type.includes('PAYMENT') ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }`}>
                                            {notification.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <h3 className={`font-medium text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                                        {notification.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 mt-1 mb-2">
                                        {notification.message}
                                    </p>

                                    {notification.linkUrl && (
                                        <Link
                                            href={notification.linkUrl}
                                            className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                                        >
                                            View Details →
                                        </Link>
                                    )}
                                </div>

                                {!notification.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        title="Mark as read"
                                        className="text-gray-400 hover:text-primary p-1 rounded-full hover:bg-white"
                                    >
                                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
