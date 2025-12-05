'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isAuthenticated, getUserRole, getStudentId } from '@/lib/auth';

interface Material {
  id: string;
  title: string;
  description: string;
  materialType: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER';
  fileUrl: string;
  fileSizeKb: number | null;
  createdAt: string;
  group?: {
    groupCode: string;
    level: { name: string };
  };
  uploadedByTeacher?: {
    firstName: string;
    lastName: string;
  };
}

interface Enrollment {
  id: string;
  groupId: string;
  group: {
    groupCode: string;
    level: { name: string };
  };
}

export default function StudentMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'STUDENT') {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const studentId = getStudentId();
      
      // First, get student's enrollments to get groupIds
      const studentRes = await fetch(`http://localhost:3001/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentData = await studentRes.json();
      
      if (!studentData.success || !studentData.data.enrollments) {
        setLoading(false);
        return;
      }

      const activeEnrollments = studentData.data.enrollments.filter(
        (e: any) => e.status === 'ACTIVE'
      );
      setEnrollments(activeEnrollments);

      // Fetch materials for each group
      const allMaterials: Material[] = [];
      
      for (const enrollment of activeEnrollments) {
        const materialsRes = await fetch(
          `http://localhost:3001/api/materials/group/${enrollment.groupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const materialsData = await materialsRes.json();
        
        if (materialsData.success && materialsData.data) {
          allMaterials.push(...materialsData.data);
        }
      }

      setMaterials(allMaterials);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'VIDEO':
        return '🎥';
      case 'LINK':
        return '🔗';
      case 'IMAGE':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'text-red-600';
      case 'VIDEO':
        return 'text-blue-600';
      case 'LINK':
        return 'text-green-600';
      case 'IMAGE':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesFilter = activeFilter === 'ALL' || m.materialType === activeFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: materials.length,
    pdfs: materials.filter(m => m.materialType === 'PDF').length,
    videos: materials.filter(m => m.materialType === 'VIDEO').length,
    links: materials.filter(m => m.materialType === 'LINK').length,
    images: materials.filter(m => m.materialType === 'IMAGE').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/student')}
            className="mb-4 flex items-center text-white/90 hover:text-white"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Learning Materials</h1>
          <p className="text-white/90">Access and download course materials</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{counts.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{counts.pdfs}</div>
            <div className="text-sm text-gray-600 mt-1">PDFs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{counts.videos}</div>
            <div className="text-sm text-gray-600 mt-1">Videos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{counts.links}</div>
            <div className="text-sm text-gray-600 mt-1">Links</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{counts.images}</div>
            <div className="text-sm text-gray-600 mt-1">Images</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-2 flex gap-2 overflow-x-auto">
          {['ALL', 'PDF', 'VIDEO', 'LINK', 'IMAGE'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'ALL' ? '📚 All' : `${getMaterialIcon(filter)} ${filter}s`}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search materials by title..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading materials...</div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              No materials available yet. Your teacher will upload materials soon.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map(material => (
              <div key={material.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl ${getMaterialColor(material.materialType)}`}>
                    {getMaterialIcon(material.materialType)}
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {material.materialType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{material.title}</h3>
                
                {material.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {material.group && (
                    <>
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <span>Group: {material.group.groupCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📊</span>
                        <span>Level: {material.group.level.name}</span>
                      </div>
                    </>
                  )}
                  {material.fileSizeKb && (
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>Size: {(material.fileSizeKb / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  {material.uploadedByTeacher && (
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>By: {material.uploadedByTeacher.firstName} {material.uploadedByTeacher.lastName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Uploaded: {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  View/Download
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}