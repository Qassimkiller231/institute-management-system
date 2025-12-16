'use client';

import { useRouter } from 'next/navigation';

export interface GroupCardData {
  id: string;
  groupCode: string;
  name: string | null;
  capacity: number;
  isActive?: boolean;
  level: {
    name: string;
    displayName: string;
  };
  term: {
    name: string;
  };
  venue: {
    name: string;
  } | null;
  hall: {
    name: string;
  } | null;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  _count: {
    enrollments: number;
    sessions?: number;
  };
}

interface GroupCardProps {
  group: GroupCardData;
  showTeacher?: boolean;
  showActions?: boolean;
  showTeacherActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReactivate?: (id: string, name: string) => void;
  onClick?: (id: string) => void;
}

export default function GroupCard({
  group,
  showTeacher = false,
  showActions = false,
  showTeacherActions = false,
  onEdit,
  onDelete,
  onReactivate,
  onClick,
}: GroupCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(group.id)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{group.groupCode}</h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
            {group.level.name}
          </span>
        </div>

        {group.name && <p className="text-gray-700 font-medium mb-4">{group.name}</p>}

        {showTeacher && group.teacher && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-gray-600">👨‍🏫</span>
            <span className="text-gray-900 font-medium">
              {group.teacher.firstName} {group.teacher.lastName}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {group._count.enrollments}/{group.capacity}
            </p>
          </div>
          {group._count.sessions !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{group._count.sessions}</p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📅</span>
            <span className="text-gray-900 font-medium">{group.term.name}</span>
          </div>
          {group.venue && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📍</span>
              <span className="text-gray-900 font-medium">{group.venue.name}</span>
            </div>
          )}
          {group.hall && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">🚪</span>
              <span className="text-gray-900 font-medium">{group.hall.name}</span>
            </div>
          )}
        </div>

        {showTeacherActions && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/teacher/attendance?groupId=${group.id}`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Attendance
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/teacher/progress?groupId=${group.id}`);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Progress
            </button>
          </div>
        )}

        {showActions && (
          <div className="mt-6 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(group.id);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            {group.isActive === false ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate?.(group.id, group.groupCode);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Reactivate
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(group.id);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
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