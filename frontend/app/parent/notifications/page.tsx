import NotificationList from '@/components/notifications/NotificationList';

export default function ParentNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500">Updates about your child&apos;s progress and institute announcements.</p>
      </div>

      <NotificationList />
    </div>
  );
}
