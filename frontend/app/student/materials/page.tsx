'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from "@/lib/auth";

interface Material {
  id: string;
  title: string;
  description: string | null;
  materialType: string;
  fileUrl: string | null;
  fileSizeKb: number | null;
  uploadedAt: string;
  teacher: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function StudentMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        const studentId = user.studentId;

        if (!studentId) {
          throw new Error('Student ID not found');
        }

        // First get student to find their group
        const studentRes = await fetch(`http://localhost:3001/api/students/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!studentRes.ok) throw new Error('Failed to fetch student data');
        const student = await studentRes.json();

        // Get active enrollment
        const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ACTIVE');
        
        if (!activeEnrollment) {
          setMaterials([]);
          setLoading(false);
          return;
        }

        // Fetch materials for the group
        const materialsRes = await fetch(
          `http://localhost:3001/api/materials?groupId=${activeEnrollment.groupId}`,
          {
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          }
        );

        if (!materialsRes.ok) throw new Error('Failed to fetch materials');
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);

      } catch (err) {
        console.error('Error fetching materials:', err);
        setError(err instanceof Error ? err.message : 'Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [router]);

  const getFilteredMaterials = () => {
    let filtered = materials;

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.materialType === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'VIDEO': return '🎥';
      case 'LINK': return '🔗';
      case 'IMAGE': return '🖼️';
      default: return '📎';
    }
  };

  const getFileSize = (sizeKb: number | null) => {
    if (!sizeKb) return '';
    if (sizeKb < 1024) return `${sizeKb} KB`;
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isNew = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  const handleDownload = (material: Material) => {
    if (material.fileUrl) {
      if (material.materialType === 'LINK') {
        window.open(material.fileUrl, '_blank');
      } else {
        window.open(material.fileUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-4 h-20"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6 h-40"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Materials</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredMaterials = getFilteredMaterials();
  const stats = {
    total: materials.length,
    pdf: materials.filter(m => m.materialType === 'PDF').length,
    video: materials.filter(m => m.materialType === 'VIDEO').length,
    link: materials.filter(m => m.materialType === 'LINK').length,
    image: materials.filter(m => m.materialType === 'IMAGE').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/student')}
            className="mb-4 text-purple-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Learning Materials</h1>
          <p className="text-purple-100">Access and download course materials</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">📄 {stats.pdf}</p>
              <p className="text-sm text-gray-600">PDFs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">🎥 {stats.video}</p>
              <p className="text-sm text-gray-600">Videos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">🔗 {stats.link}</p>
              <p className="text-sm text-gray-600">Links</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">🖼️ {stats.image}</p>
              <p className="text-sm text-gray-600">Images</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('PDF')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'PDF'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📄 PDFs
              </button>
              <button
                onClick={() => setFilterType('VIDEO')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'VIDEO'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎥 Videos
              </button>
              <button
                onClick={() => setFilterType('LINK')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'LINK'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Links
              </button>
              <button
                onClick={() => setFilterType('IMAGE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'IMAGE'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🖼️ Images
              </button>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              {materials.length === 0 
                ? 'No materials available yet. Your teacher will upload materials soon.'
                : 'No materials found matching your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div 
                key={material.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 cursor-pointer group"
                onClick={() => setSelectedMaterial(material)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{getFileIcon(material.materialType)}</span>
                  {isNew(material.uploadedAt) && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      NEW
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {material.title}
                </h3>

                {material.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {material.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <span>📅</span> {formatDate(material.uploadedAt)}
                  </p>
                  {material.teacher && (
                    <p className="flex items-center gap-2">
                      <span>👨‍🏫</span> {material.teacher.firstName} {material.teacher.lastName}
                    </p>
                  )}
                  {material.fileSizeKb && (
                    <p className="flex items-center gap-2">
                      <span>📊</span> {getFileSize(material.fileSizeKb)}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(material);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {material.materialType === 'LINK' ? 'Open Link' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material Preview Modal */}
      {selectedMaterial && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedMaterial(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{getFileIcon(selectedMaterial.materialType)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                    <p className="text-sm text-gray-600">{selectedMaterial.materialType}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedMaterial.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedMaterial.description}</p>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex items-center gap-2">
                  <span>📅</span> Uploaded {formatDate(selectedMaterial.uploadedAt)}
                </p>
                {selectedMaterial.teacher && (
                  <p className="flex items-center gap-2">
                    <span>👨‍🏫</span> {selectedMaterial.teacher.firstName} {selectedMaterial.teacher.lastName}
                  </p>
                )}
                {selectedMaterial.fileSizeKb && (
                  <p className="flex items-center gap-2">
                    <span>📊</span> {getFileSize(selectedMaterial.fileSizeKb)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedMaterial)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {selectedMaterial.materialType === 'LINK' ? 'Open Link' : 'Download'}
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}