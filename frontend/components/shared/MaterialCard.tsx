'use client';

export interface MaterialCardData {
  id: string;
  title: string;
  description?: string;
  materialType: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER';
  fileUrl?: string;
  fileSizeKb?: number;
  uploadedAt: string;
  group: {
    id?: string;
    groupCode: string;
    name?: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

interface MaterialCardProps {
  material: MaterialCardData;
  canDelete?: boolean;
  canEdit?: boolean;
  showTeacher?: boolean;
  onDelete?: (id: string, title: string) => void;
  onEdit?: (material: MaterialCardData) => void;
}

export default function MaterialCard({
  material,
  canDelete = false,
  canEdit = false,
  showTeacher = false,
  onDelete,
  onEdit,
}: MaterialCardProps) {
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'VIDEO': return '🎥';
      case 'LINK': return '🔗';
      case 'IMAGE': return '🖼️';
      default: return '📎';
    }
  };

  const formatFileSize = (sizeInKb?: number) => {
    if (!sizeInKb) return 'N/A';
    if (sizeInKb < 1024) return `${sizeInKb} KB`;
    return `${(sizeInKb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{getMaterialIcon(material.materialType)}</span>
        {(canDelete || canEdit) && (
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(material)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(material.id, material.title)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
      
      {material.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {material.description}
        </p>
      )}

      <div className="space-y-1 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📚</span>
          <span>{material.group.groupCode}</span>
        </div>
        {showTeacher && material.teacher && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">👨‍🏫</span>
            <span>{material.teacher.firstName} {material.teacher.lastName}</span>
          </div>
        )}
        <div>Type: {material.materialType}</div>
        <div>Size: {formatFileSize(material.fileSizeKb)}</div>
        <div>
          Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
        </div>
      </div>

      {material.fileUrl && (
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View/Download
        </a>
      )}
    </div>
  );
}