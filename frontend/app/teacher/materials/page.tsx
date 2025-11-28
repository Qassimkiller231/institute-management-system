'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getTeacherId } from '@/lib/auth';
interface Material {
  id: string;
  title: string;
  description?: string;
  materialType: string;
  fileUrl?: string;
  fileSizeKb?: number;
  uploadedAt: string;
  group: {
    groupCode: string;
    name?: string;
  };
}

interface Group {
  id: string;
  groupCode: string;
  name?: string;
}

export default function UploadMaterials() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    description: '',
    materialType: 'PDF',
    fileUrl: ''
  });

  useEffect(() => {
    fetchGroups();
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (selectedGroup !== 'all') {
      fetchMaterials();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const token = getToken();
      const teacherId = getTeacherId();
      
      const response = await fetch(`http://localhost:3001/api/groups?teacherId=${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setGroups(data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const teacherId = getTeacherId();

      // Get all groups for this teacher
      const groupsRes = await fetch(
        `http://localhost:3001/api/groups?teacherId=${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const groupsData = await groupsRes.json();
      const teacherGroups = groupsData.data || [];

      let allMaterials: Material[] = [];

      if (selectedGroup === 'all') {
        // Fetch materials from all groups
        for (const group of teacherGroups) {
          const materialsRes = await fetch(
            `http://localhost:3001/api/materials?groupId=${group.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const materialsData = await materialsRes.json();
          allMaterials = [...allMaterials, ...(materialsData.data || [])];
        }
      } else {
        // Fetch materials from selected group only
        const materialsRes = await fetch(
          `http://localhost:3001/api/materials?groupId=${selectedGroup}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const materialsData = await materialsRes.json();
        allMaterials = materialsData.data || [];
      }

      // Sort by upload date (newest first)
      allMaterials.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setMaterials(allMaterials);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!formData.groupId || !formData.title || !formData.fileUrl) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const token = getToken();

      const response = await fetch('http://localhost:3001/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload material');
      }

      alert('Material uploaded successfully!');
      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete material');

      alert('Material deleted successfully!');
      fetchMaterials();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      groupId: '',
      title: '',
      description: '',
      materialType: 'PDF',
      fileUrl: ''
    });
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/teacher/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Learning Materials</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Upload Material
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.groupCode} {group.name && `- ${group.name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Materials</div>
            <div className="text-3xl font-bold text-blue-600">{materials.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">PDFs</div>
            <div className="text-3xl font-bold text-red-600">
              {materials.filter(m => m.materialType === 'PDF').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Videos</div>
            <div className="text-3xl font-bold text-purple-600">
              {materials.filter(m => m.materialType === 'VIDEO').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Links</div>
            <div className="text-3xl font-bold text-green-600">
              {materials.filter(m => m.materialType === 'LINK').length}
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        ) : materials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(material => (
              <div key={material.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{getMaterialIcon(material.materialType)}</span>
                  <button
                    onClick={() => handleDelete(material.id, material.title)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{material.title}</h3>
                
                {material.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {material.description}
                  </p>
                )}

                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <div>Group: {material.group.groupCode}</div>
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
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
            No materials found
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Upload New Material</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group *
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.groupCode} {group.name && `- ${group.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Unit 5 Vocabulary List"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the material..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type *
                </label>
                <select
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="LINK">External Link</option>
                  <option value="IMAGE">Image</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File URL *
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Upload files to cloud storage (Google Drive, Dropbox) and paste the public link here
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}