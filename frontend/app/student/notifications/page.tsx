import NotificationList from '@/components/notifications/NotificationList';

export default function StudentNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Notifications</h1>
        <p className="text-gray-500">Check your latest updates, announcements, and results.</p>
      </div>

      <NotificationList />
    </div>
  );
}
