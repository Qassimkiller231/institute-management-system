"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MaterialCard, {
  MaterialCardData,
} from "@/components/shared/MaterialCard";
import { materialsAPI, groupsAPI, programsAPI, CreateMaterialDto, UpdateMaterialDto } from "@/lib/api";

export default function AdminMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialCardData | null>(null);

  // ✅ Separate states for create and edit
  const [formData, setFormData] = useState<CreateMaterialDto | any>({
    title: "",
    description: "",
    materialType: "PDF" as "PDF" | "VIDEO" | "LINK" | "IMAGE" | "OTHER",
    fileUrl: "",
    groupId: "",
    scheduledFor: "",
    publishNow: true,
  });

  const [editData, setEditData] = useState<UpdateMaterialDto>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchGroups();
    fetchPrograms();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await groupsAPI.getAll({ isActive: true });
      setGroups(data.data || []);
    } catch (err) {
      // console.error("Failed to fetch groups", err);
    }
  };

  const fetchPrograms = async () => {
    try {
      // ✅ Filter for active programs only
      const response = await programsAPI.getAll(true);
      const data = response.data || [];
      setPrograms(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      // console.error("Failed to fetch programs", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialsAPI.getAll();
      // Filter only active materials since backend does soft delete
      setMaterials((data.data || []).filter((m: any) => m.isActive !== false));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await materialsAPI.delete(id);
        alert("Material deleted successfully!");
        fetchMaterials(); // Refresh the list
      } catch (err: any) {
        alert("Error: " + err.message);
      }
    }
  };

  // ✅ Populate editData when editing
  const handleEdit = (material: MaterialCardData) => {
    setEditingMaterial(material);
    setEditData({
      title: material.title,
      description: material.description || "",
      materialType: material.materialType as "PDF" | "VIDEO" | "LINK" | "IMAGE" | "OTHER",
      fileUrl: material.fileUrl || "",
    });
    setShowModal(true);
  };

  // ✅ Use editData for validation and update
  const handleSave = async () => {
    if (!editingMaterial || !editData.title || !editData.fileUrl) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await materialsAPI.update(editingMaterial.id, editData);
      alert("Material updated successfully!");
      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // ✅ Create new material
  const handleCreate = async () => {
    if (!formData.title || !formData.fileUrl) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await materialsAPI.create(formData);
      alert("Material created successfully!");
      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      materialType: "PDF",
      fileUrl: "",
      groupId: "",
    });
    setEditData({
      title: "",
      description: "",
      materialType: "PDF",
      fileUrl: "",
    });
    setEditingMaterial(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterType("all");
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.group.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all"
      ? true // Show everything including scheduled
      : filterType === "SCHEDULED"
        ? material.isPublished === false
        : material.materialType === filterType && material.isPublished !== false;

    return matchesSearch && matchesType;
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><div className="animate-pulse"><div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white rounded-lg shadow p-6 h-64"></div>)}</div></div></div></div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><div className="bg-red-50 border border-red-200 rounded-lg p-6"><p className="text-red-800 font-semibold">Error loading materials</p><p className="text-red-600 mt-2">{error}</p><button onClick={fetchMaterials} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Try Again</button></div></div></div>
  );

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6"><div className="max-w-7xl mx-auto"><div className="flex items-center justify-between"><div><h1 className="text-4xl font-bold mb-2">Learning Materials</h1><p className="text-purple-100">Manage all course materials across all groups</p></div><button onClick={() => { setEditingMaterial(null); resetForm(); setShowModal(true); }} className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition shadow-lg">+ Upload Material</button></div></div></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold text-gray-700">Search & Filter</h3><button onClick={resetFilters} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Reset</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Search by title, group, or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900" /><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"><option value="all">All Types</option>
      <option value="SCHEDULED">⏰ Scheduled</option>
      <option value="PDF">PDF Only</option>
      <option value="VIDEO">Video Only</option><option value="LINK">Link Only</option><option value="IMAGE">Image Only</option><option value="OTHER">Other</option></select></div></div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"><div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Total Materials</p><p className="text-3xl font-bold text-gray-900">{materials.length}</p></div><div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">PDFs</p><p className="text-3xl font-bold text-red-600">{materials.filter((m) => m.materialType === "PDF").length}</p></div><div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Videos</p><p className="text-3xl font-bold text-purple-600">{materials.filter((m) => m.materialType === "VIDEO").length}</p></div><div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Links</p><p className="text-3xl font-bold text-green-600">{materials.filter((m) => m.materialType === "LINK").length}</p></div><div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Images</p><p className="text-3xl font-bold text-blue-600">{materials.filter((m) => m.materialType === "IMAGE").length}</p></div></div>
  );

  const renderEmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center"><div className="text-6xl mb-4">📭</div><h3 className="text-xl font-semibold text-gray-900 mb-2">{searchTerm || filterType !== "all" ? "No materials match your filters" : "No materials uploaded yet"}</h3><p className="text-gray-600">{searchTerm || filterType !== "all" ? "Try adjusting your search or filters" : "Materials will appear here once teachers upload them"}</p></div>
  );

  const renderMaterialsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredMaterials.map((material) => <MaterialCard key={material.id} material={material} canDelete={true} canEdit={true} showTeacher={true} onDelete={handleDelete} onEdit={handleEdit} />)}</div>
  );

  const renderModalForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={editingMaterial ? editData.title : formData.title}
          onChange={(e) => editingMaterial ? setEditData({ ...editData, title: e.target.value }) : setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          placeholder="e.g., Unit 5 Vocabulary List"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingMaterial ? editData.description : formData.description}
          onChange={(e) => editingMaterial ? setEditData({ ...editData, description: e.target.value }) : setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          rows={3}
          placeholder="Brief description of the material..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material Type *</label>
        <select
          value={editingMaterial ? editData.materialType : formData.materialType}
          onChange={(e) => {
            const val = e.target.value as "PDF" | "VIDEO" | "LINK" | "IMAGE" | "OTHER";
            editingMaterial ? setEditData({ ...editData, materialType: val }) : setFormData({ ...formData, materialType: val });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
        >
          <option value="PDF">PDF Document</option>
          <option value="VIDEO">Video</option>
          <option value="LINK">External Link</option>
          <option value="IMAGE">Image</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
        <select
          value={selectedProgramId}
          onChange={(e) => {
            setSelectedProgramId(e.target.value);
            if (editingMaterial) {
              setEditData({ ...editData, groupId: '' });
            } else {
              setFormData({ ...formData, groupId: '' });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          required
        >
          <option value="">Select Program</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>{program.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group *</label>
        <select
          value={editingMaterial ? editData.groupId : formData.groupId}
          onChange={(e) => editingMaterial ? setEditData({ ...editData, groupId: e.target.value }) : setFormData({ ...formData, groupId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          required
          disabled={!selectedProgramId}
        >
          <option value="">Select Group</option>
          {groups
            .filter(group => !selectedProgramId || group.term?.program?.id === selectedProgramId)
            .map((group) => (
              <option key={group.id} value={group.id}>{group.groupCode} - {group.name}</option>
            ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
        <input
          type="url"
          value={editingMaterial ? editData.fileUrl : formData.fileUrl}
          onChange={(e) => editingMaterial ? setEditData({ ...editData, fileUrl: e.target.value }) : setFormData({ ...formData, fileUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
          placeholder="https://..."
          required
        />
      </div>

      {!editingMaterial && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="publishNow"
              checked={!(formData as any).publishNow}
              onChange={(e) => setFormData({
                ...formData,
                publishNow: !e.target.checked
              } as any)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="publishNow" className="ml-2 block text-sm font-medium text-gray-900">
              Schedule for later?
            </label>
          </div>

          {!(formData as any).publishNow && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date & Time *
              </label>
              <input
                type="datetime-local"
                value={(formData as any).scheduledFor || ''}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value } as any)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                required={!(formData as any).publishNow}
              />
              <p className="mt-1 text-xs text-gray-500">
                Material will be automatically published at this time.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold mb-6 text-gray-900">{editingMaterial ? "Edit Material" : "Upload New Material"}</h2>{renderModalForm()}<div className="mt-6 flex space-x-3"><button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={editingMaterial ? handleSave : handleCreate} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{editingMaterial ? "Update Material" : "Upload Material"}</button></div></div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderFilters()}
        {renderStats()}
        {filteredMaterials.length === 0 ? renderEmptyState() : renderMaterialsGrid()}
      </div>

      {renderModal()}
    </div>
  );
}