'use client';

import { useState, useEffect } from 'react';
import { notificationAPI, Notification } from '@/lib/api/notifications';
import { Bell, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardNotificationWidget({ portal }: { portal: 'admin' | 'student' | 'teacher' }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationAPI.getMyNotifications(5); // Limit to 5
                if (res.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard notifications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return null; // Don't show loading on dashboard widgets to avoid flicker
    if (notifications.length === 0) return null; // Don't show empty widget if no notifications

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-gray-800">Recent Notifications</h3>
                </div>
                <Link
                    href={`/${portal}/notifications`}
                    className="text-xs text-primary hover:underline font-medium"
                >
                    View All
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {notifications.slice(0, 3).map((notification) => ( // Show top 3 only
                    <div key={notification.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                            <div className="min-w-0">
                                <p className={`text-sm text-gray-900 truncate ${!notification.isRead ? 'font-medium' : ''}`}>
                                    {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
