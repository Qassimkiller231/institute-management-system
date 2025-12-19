import NotificationList from '@/components/notifications/NotificationList';

export default function TeacherNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500">Updates on student assignments, speaking slots, and more.</p>
      </div>

      <NotificationList />
    </div>
  );
}
