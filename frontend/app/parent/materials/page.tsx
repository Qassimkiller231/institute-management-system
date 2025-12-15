'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Material {
  id: string;
  title: string;
  description?: string;
  materialType: string; // Changed from type - actual DB field
  fileUrl?: string;
  uploadedAt: string;
  group?: {
    id: string;
    name: string;
    level: {
      id: string;
      name: string;
    };
  };
}

export default function ParentMaterialsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/api/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        // Don't throw error, just set empty array
        console.error('Failed to fetch materials:', res.status);
        setMaterials([]);
        return;
      }
      
      const data = await res.json();
      setMaterials(data.data || []);
    } catch (err: any) {
      console.error('Error loading materials:', err);
      // Set empty array instead of showing alert
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.materialType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SLIDES':
        return '📊';
      case 'VIDEO':
        return '🎥';
      case 'DOCUMENT':
        return '📄';
      case 'AUDIO':
        return '🎵';
      case 'LINK':
        return '🔗';
      case 'OTHER':
        return '📁';
      default:
        return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SLIDES':
        return 'bg-blue-100 text-blue-800';
      case 'VIDEO':
        return 'bg-purple-100 text-purple-800';
      case 'DOCUMENT':
        return 'bg-green-100 text-green-800';
      case 'AUDIO':
        return 'bg-pink-100 text-pink-800';
      case 'LINK':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading materials...</p>
      </div>
    );
  }

  const materialTypes = ['all', ...new Set(materials.map(m => m.materialType).filter(t => t))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Materials</h2>
        <p className="text-gray-600 mb-4">Access course materials and resources</p>
        
        {/* Search and Filter */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            {materialTypes.filter(type => type).map(type => ( // Filter out undefined/null
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Materials Found</h3>
          <p className="text-gray-600">
            {materials.length === 0 
              ? 'No learning materials are available at this time.'
              : 'No materials match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                {/* Icon and Type */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{getTypeIcon(material.materialType)}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.materialType)}`}>
                    {material.materialType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {material.title}
                </h3>

                {/* Description */}
                {material.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {material.description}
                  </p>
                )}

                {/* Group Info */}
                {material.group && (
                  <div className="mb-3 text-xs text-gray-500">
                    <p>{material.group.name}</p>
                    <p>{material.group.level.name}</p>
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500 mb-4">
                  Added {material.uploadedAt ? new Date(material.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>

                {/* Action Button */}
                {material.fileUrl ? (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    {material.materialType === 'LINK' ? 'Open Link' : 'Download'}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    No File Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {materials.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Materials Overview</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-green-100 text-sm">Total Materials</p>
              <p className="text-3xl font-bold">{materials.length}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Documents</p>
              <p className="text-3xl font-bold">
                {materials.filter(m => m.materialType?.toUpperCase() === 'PDF' || m.materialType?.toUpperCase() === 'DOCUMENT').length}
              </p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Videos</p>
              <p className="text-3xl font-bold">
                {materials.filter(m => m.materialType?.toUpperCase() === 'VIDEO').length}
              </p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Links</p>
              <p className="text-3xl font-bold">
                {materials.filter(m => m.materialType?.toUpperCase() === 'LINK').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
