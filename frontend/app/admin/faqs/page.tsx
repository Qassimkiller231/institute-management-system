'use client';

import React, { useState, useEffect } from 'react';
import { faqsAPI, FAQ, CreateFAQDto, UpdateFAQDto } from '@/lib/api';

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const [formData, setFormData] = useState<CreateFAQDto>({
    question: '',
    keywords: [],
    answer: '',
    category: '',
    roles: ['ALL'],
    isActive: true,
    order: 0
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => { fetchFAQs(); }, [filterStatus]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      let isActiveParam: boolean | undefined = undefined;
      if (filterStatus === 'active') isActiveParam = true;
      else if (filterStatus === 'inactive') isActiveParam = false;
      
      const response = await faqsAPI.getAll(isActiveParam);
      setFaqs(response.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.question || !formData.answer || formData.keywords.length === 0) {
      return alert('Question, answer, and at least one keyword are required');
    }
    try {
      await faqsAPI.create(formData);
      alert('FAQ created!');
      setShowModal(false);
      resetForm();
      fetchFAQs();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFAQ) return;
    try {
      const updateData: UpdateFAQDto = {
        question: formData.question,
        keywords: formData.keywords,
        answer: formData.answer,
        category: formData.category,
        roles: formData.roles,
        isActive: formData.isActive,
        order: formData.order
      };
      await faqsAPI.update(selectedFAQ.id, updateData);
      alert('FAQ updated!');
      setShowModal(false);
      resetForm();
      fetchFAQs();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete FAQ: "${question}"?`)) return;
    try {
      await faqsAPI.delete(id);
      alert('FAQ deleted!');
      fetchFAQs();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (faq: FAQ) => {
    try {
      await faqsAPI.update(faq.id, { isActive: !faq.isActive });
      fetchFAQs();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedFAQ(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (faq: FAQ) => {
    setModalMode('edit');
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      keywords: faq.keywords,
      answer: faq.answer,
      category: faq.category || '',
      roles: faq.roles,
      isActive: faq.isActive,
      order: faq.order
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      keywords: [],
      answer: '',
      category: '',
      roles: ['ALL'],
      isActive: true,
      order: 0
    });
    setKeywordInput('');
    setSelectedFAQ(null);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  const filtered = faqs.filter(faq => {
    const search = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return search;
  });

  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    inactive: faqs.filter(f => !f.isActive).length
  };

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <button
            onClick={openCreateModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Add FAQ
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total FAQs</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
            >
              <option value="active">Active Only</option>
              <option value="all">All FAQs</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keywords</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{faq.question}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{faq.answer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {faq.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                        {faq.keywords.length > 3 && (
                          <span className="text-xs text-gray-500">+{faq.keywords.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{faq.category || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button onClick={() => openEditModal(faq)} className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleToggle(faq)} className="text-orange-600 hover:text-orange-800">
                        {faq.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(faq.id, faq.question)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-900">No FAQs found</div>}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {modalMode === 'create' ? 'Add FAQ' : 'Edit FAQ'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  placeholder="What is your question?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords * (press Enter to add)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                    placeholder="Enter keyword"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="text-blue-900 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  rows={4}
                  placeholder="Enter the answer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  placeholder="e.g., Payments, Attendance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <select
                  multiple
                  value={formData.roles}
                  onChange={(e) => setFormData({ ...formData, roles: Array.from(e.target.selectedOptions, o => o.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {modalMode === 'create' ? 'Create' : 'Update'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
