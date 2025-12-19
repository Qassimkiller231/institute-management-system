import NotificationList from '@/components/notifications/NotificationList';

export default function AdminNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications & Alerts</h1>
        <p className="text-gray-500">Stay updated with important events and tasks.</p>
      </div>

      <NotificationList />
    </div>
  );
}
