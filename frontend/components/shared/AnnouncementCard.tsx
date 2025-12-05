'use client';

export interface AnnouncementCardData {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  group?: {
    id?: string;
    groupCode: string;
    name?: string;
  };
  term?: {
    id?: string;
    name: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

interface AnnouncementCardProps {
  announcement: AnnouncementCardData;
  canDelete?: boolean;
  canEdit?: boolean;
  showTeacher?: boolean;
  onDelete?: (id: string, title: string) => void;
  onEdit?: (announcement: AnnouncementCardData) => void;
}

export default function AnnouncementCard({
  announcement,
  canDelete = false,
  canEdit = false,
  showTeacher = false,
  onDelete,
  onEdit,
}: AnnouncementCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getPriorityIcon(announcement.priority)}</span>
            <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(announcement.priority)}`}>
              {announcement.priority}
            </span>
          </div>
          
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{announcement.content}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span>📚</span>
              <span>{announcement.group?.groupCode || announcement.term?.name || 'General'}</span>
            </span>
            {showTeacher && announcement.teacher && (
              <span className="flex items-center gap-1">
                <span>👨‍🏫</span>
                <span>{announcement.teacher.firstName} {announcement.teacher.lastName}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <span>📅</span>
              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
        
        {(canDelete || canEdit) && (
          <div className="ml-4 flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(announcement)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(announcement.id, announcement.title)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}