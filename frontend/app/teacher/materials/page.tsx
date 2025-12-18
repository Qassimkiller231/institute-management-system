'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId } from '@/lib/authStorage';
import { groupsAPI, materialsAPI } from '@/lib/api';
import MaterialCard, { MaterialCardData } from '@/components/shared/MaterialCard';

interface Group {
  id: string;
  groupCode: string;
  name?: string;
}

export default function TeacherMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialCardData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialCardData | null>(null);
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
      const teacherId = getTeacherId();
      if (!teacherId) return;
      
      const data = await groupsAPI.getAll({ teacherId });
      setGroups(data.data || []);
    } catch (err) {
      // console.error('Error fetching groups:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      if (!teacherId) return;

      // Get all groups for this teacher
      const groupsData = await groupsAPI.getAll({ teacherId });
      const teacherGroups = groupsData.data || [];

      let allMaterials: MaterialCardData[] = [];

      if (selectedGroup === 'all') {
        // Fetch materials from all groups
        for (const group of teacherGroups) {
          const materialsData = await materialsAPI.getAll({ groupId: group.id });
          allMaterials = [...allMaterials, ...(materialsData.data || [])];
        }
      } else {
        // Fetch materials from selected group only
        const materialsData = await materialsAPI.getAll({ groupId: selectedGroup });
        allMaterials = materialsData.data || [];
      }

      // Sort by upload date (newest first)
      allMaterials.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      setMaterials(allMaterials);
    } catch (err) {
      // console.error('Error fetching materials:', err);
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

      if (editingMaterial) {
        await materialsAPI.update(editingMaterial.id, formData);
        alert('Material updated successfully!');
      } else {
        await materialsAPI.create(formData);
        alert('Material uploaded successfully!');
      }

      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (material: MaterialCardData) => {
    setEditingMaterial(material);
    setFormData({
      groupId: material.group.id || '',
      title: material.title,
      description: material.description || '',
      materialType: material.materialType,
      fileUrl: material.fileUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await materialsAPI.delete(id);
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
    setEditingMaterial(null);
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/teacher')}
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
    );
  };

  /**
   * Render search and filter section
   */
  const renderFilters = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Materials
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render stats grid
   */
  const renderStats = () => {
    const pdfCount = materials.filter(m => m.materialType === 'PDF').length;
    const videoCount = materials.filter(m => m.materialType === 'VIDEO').length;
    const linkCount = materials.filter(m => m.materialType === 'LINK').length;

    return (
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Materials</div>
          <div className="text-3xl font-bold text-blue-600">{materials.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">PDFs</div>
          <div className="text-3xl font-bold text-red-600">{pdfCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Videos</div>
          <div className="text-3xl font-bold text-purple-600">{videoCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Links</div>
          <div className="text-3xl font-bold text-green-600">{linkCount}</div>
        </div>
      </div>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading materials...</p>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
        No materials found
      </div>
    );
  };

  /**
   * Render materials grid
   */
  const renderMaterialsGrid = () => {
    const filteredMaterials = materials.filter(m => 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <MaterialCard
            key={material.id}
            material={material}
            canDelete={true}
            canEdit={true}
            showTeacher={false}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    );
  };

  /**
   * Render materials section
   */
  const renderMaterialsSection = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (materials.length === 0) {
      return renderEmptyState();
    }

    return renderMaterialsGrid();
  };

  /**
   * Render upload modal
   */
  const renderUploadModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">
            {editingMaterial ? 'Edit Material' : 'Upload New Material'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group *
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              {uploading ? 'Saving...' : editingMaterial ? 'Update Material' : 'Upload Material'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render main materials page
   */
  const renderMaterialsPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderFilters()}
          {renderStats()}
          {renderMaterialsSection()}
        </main>

        {renderUploadModal()}
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  

return renderMaterialsPage();
}