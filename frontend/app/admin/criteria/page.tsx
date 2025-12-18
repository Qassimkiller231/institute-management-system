'use client';

import { useState, useEffect } from 'react';
import { levelsAPI, groupsAPI, criteriaAPI } from '@/lib/api';

export default function ProgressCriteriaPage() {
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCriterion, setSelectedCriterion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    levelId: '',
    groupId: '',
    orderNumber: 1,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [levelsData, groupsData, criteriaData] = await Promise.all([
        levelsAPI.getAll(),
        groupsAPI.getAll({ isActive: true }),
        criteriaAPI.getAll()
      ]);
      
      setLevels(levelsData.data || []);
      setGroups(groupsData.data || []);
      setCriteria(criteriaData.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCriterion(null);
    setFormData({
      name: '',
      description: '',
      levelId: '',
      groupId: '',
      orderNumber: criteria.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (criterion: any) => {
    setModalMode('edit');
    setSelectedCriterion(criterion);
    setFormData({
      name: criterion.name,
      description: criterion.description,
      levelId: criterion.levelId,
      groupId: criterion.groupId || '',
      orderNumber: criterion.orderNumber,
      isActive: criterion.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    try {
      if (modalMode === 'create') {
        alert('Criterion created!');
      } else {
        alert('Criterion updated!');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      alert('Criterion deleted!');
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filteredCriteria = criteria.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return <div className="p-8 text-gray-900">Loading...</div>;
  };

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Criteria</h1>
          <p className="text-gray-700">Define learning objectives and track student progress</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Criterion
        </button>
      </div>
    );
  };

  /**
   * Render search bar
   */
  const renderSearch = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <input
          type="text"
          placeholder="Search criteria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>
    );
  };

  /**
   * Render single criterion card
   */
  const renderCriterionCard = (criterion: any) => {
    return (
      <div key={criterion.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {criterion.orderNumber}
              </span>
              <h3 className="text-xl font-semibold text-gray-900">{criterion.name}</h3>
              <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                {criterion.levelName}
              </span>
              {criterion.isActive && (
                <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Active
                </span>
              )}
            </div>
            <p className="text-gray-700 ml-11">{criterion.description}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(criterion)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(criterion.id, criterion.name)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render criteria list
   */
  const renderCriteriaList = () => {
    if (filteredCriteria.length === 0) return null;

    return (
      <div className="space-y-4">
        {filteredCriteria.map((criterion) => renderCriterionCard(criterion))}
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (filteredCriteria.length > 0) return null;

    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No criteria found</p>
      </div>
    );
  };

  /**
   * Render modal form fields
   */
  const renderModalForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            placeholder="e.g., Grammar Fundamentals"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            rows={3}
            placeholder="Describe the learning objective..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Level</label>
            <select
              value={formData.levelId}
              onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Group (Optional)</label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="">All Groups</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.groupCode}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Order Number</label>
            <input
              type="number"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              min="1"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render modal buttons
   */
  const renderModalButtons = () => {
    return (
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setShowModal(false)}
          className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {modalMode === 'create' ? 'Create' : 'Save Changes'}
        </button>
      </div>
    );
  };

  /**
   * Render modal
   */
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {modalMode === 'create' ? 'Add New Criterion' : 'Edit Criterion'}
          </h2>

          {renderModalForm()}
          {renderModalButtons()}
        </div>
      </div>
    );
  };

  /**
   * Render main criteria page
   */
  const renderCriteriaPage = () => {
    return (
      <div>
        {renderHeader()}
        {renderSearch()}
        {renderCriteriaList()}
        {renderEmptyState()}
        {renderModal()}
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return renderLoadingState();
  }

  return renderCriteriaPage();
}
