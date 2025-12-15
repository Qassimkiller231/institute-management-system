'use client';

import { useState, useEffect } from 'react';
import { paymentsAPI } from '@/lib/api';

export default function PaymentPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);
  const [showAddInstallment, setShowAddInstallment] = useState(false);
  const [newInstallment, setNewInstallment] = useState({
    amount: 0,
    dueDate: ''
  });
  const [editForm, setEditForm] = useState({
    totalAmount: 0,
    discountAmount: 0,
    discountReason: ''
  });
  const [createForm, setCreateForm] = useState({
    enrollmentId: '',
    totalAmount: 0,
    discountAmount: 0,
    discountReason: '',
    totalInstallments: 4,
    installments: [] as any[]
  });

  useEffect(() => {
    fetchPlans();
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      
      const data = await response.json();
      
      // Get all enrollments first
      const allEnrollments = data.data || [];
      
      // Filter out enrollments that already have payment plans
      const enrollmentsWithoutPlans = allEnrollments.filter((enr: any) => 
        !plans.some(plan => plan.enrollmentId === enr.id)
      );
      
      setEnrollments(enrollmentsWithoutPlans);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setEnrollments([]);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAllPlans();
      setPlans(response.data || []);
    } catch (err: any) {
      alert('Error fetching payment plans: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlanStatus = (plan: any) => {
    if (!plan.installments || plan.installments.length === 0) return 'No Installments';
    
    const totalPaid = plan.installments
      .filter((inst: any) => inst.paymentDate !== null)
      .reduce((sum: number, inst: any) => sum + Number(inst.amount), 0);
    
    const totalAmount = Number(plan.finalAmount);
    
    if (totalPaid >= totalAmount) return 'Fully Paid';
    
    const hasOverdue = plan.installments.some((inst: any) => 
      !inst.paymentDate && inst.dueDate && new Date(inst.dueDate) < new Date()
    );
    
    return hasOverdue ? 'Overdue' : 'In Progress';
  };

  const calculatePaidAmount = (plan: any) => {
    return plan.installments
      ?.filter((inst: any) => inst.paymentDate !== null)
      .reduce((sum: number, inst: any) => sum + Number(inst.amount), 0) || 0;
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setEditForm({
      totalAmount: Number(plan.totalAmount),
      discountAmount: Number(plan.discountAmount) || 0,
      discountReason: plan.discountReason || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (plan: any) => {
    if (!confirm(`Are you sure you want to delete the payment plan for ${plan.enrollment?.student?.firstName || 'this student'}?\n\nThis will permanently delete all installments. This action cannot be undone!`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans/${plan.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete payment plan');
      }
      
      alert('Payment plan deleted successfully!');
      fetchPlans();
    } catch (err: any) {
      alert('Error deleting payment plan: ' + err.message);
    }
  };

  const submitEdit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update payment plan');
      }
      
      alert('Payment plan updated successfully!');
      setShowEditModal(false);
      fetchPlans();
    } catch (err: any) {
      alert('Error updating payment plan: ' + err.message);
    }
  };

  const handleCreatePlan = () => {
    fetchEnrollments(); // Refresh enrollments list before showing modal
    setCreateForm({
      enrollmentId: '',
      totalAmount: 0,
      discountAmount: 0,
      discountReason: '',
      totalInstallments: 4,
      installments: []
    });
    setShowCreateModal(true);
  };

  const generateInstallments = () => {
    const finalAmount = createForm.totalAmount - createForm.discountAmount;
    const installmentAmount = finalAmount / createForm.totalInstallments;
    const installments = [];
    
    for (let i = 1; i <= createForm.totalInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      installments.push({
        installmentNumber: i,
        amount: installmentAmount,
        paymentDate: dueDate.toISOString().split('T')[0]
      });
    }
    
    setCreateForm({ ...createForm, installments });
  };

  const submitCreate = async () => {
    if (!createForm.enrollmentId || createForm.installments.length === 0) {
      alert('Please select an enrollment and generate installments');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment plan');
      }
      
      alert('Payment plan created successfully!');
      setShowCreateModal(false);
      fetchPlans();
      fetchEnrollments();
    } catch (err: any) {
      alert('Error creating payment plan: ' + err.message);
    }
  };

  const handleViewInstallments = (plan: any) => {
    setSelectedPlan(plan);
    setShowInstallmentsModal(true);
    setShowAddInstallment(false);
    setEditingInstallmentId(null);
  };

  const handleAddInstallment = async () => {
    if (!newInstallment.amount || !newInstallment.dueDate) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans/${selectedPlan.id}/installments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInstallment)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Installment added successfully!');
      setShowAddInstallment(false);
      setNewInstallment({ amount: 0, dueDate: '' });
      fetchPlans(); // Refresh to get updated plan
      // Re-open modal with updated data
      const updatedPlans = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      })).json();
      const updatedPlan = updatedPlans.data?.find((p: any) => p.id === selectedPlan.id);
      if (updatedPlan) setSelectedPlan(updatedPlan);
    } catch (err: any) {
      alert('Error adding installment: ' + err.message);
    }
  };

  const handleEditInstallment = (inst: any) => {
    setEditingInstallmentId(inst.id);
    setEditingInstallment({
      amount: Number(inst.amount),
      dueDate: inst.dueDate ? new Date(inst.dueDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveInstallment = async (instId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/installments/${instId}/details`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingInstallment)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Installment updated successfully!');
      setEditingInstallmentId(null);
      fetchPlans();
      // Refresh modal data
      const updatedPlans = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      })).json();
      const updatedPlan = updatedPlans.data?.find((p: any) => p.id === selectedPlan.id);
      if (updatedPlan) setSelectedPlan(updatedPlan);
    } catch (err: any) {
      alert('Error updating installment: ' + err.message);
    }
  };

  const handleDeleteInstallment = async (instId: string) => {
    if (!confirm('Are you sure you want to delete this installment?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/installments/${instId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Installment deleted successfully!');
      fetchPlans();
      // Refresh modal  data
      const updatedPlans = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/payments/plans`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      })).json();
      const updatedPlan = updatedPlans.data?.find((p: any) => p.id === selectedPlan.id);
      if (updatedPlan) setSelectedPlan(updatedPlan);
    } catch (err: any) {
      alert('Error deleting installment: ' + err.message);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const studentName = `${plan.enrollment?.student?.firstName || ''} ${plan.enrollment?.student?.secondName || ''}`.toLowerCase();
    const groupCode = plan.enrollment?.group?.groupCode?.toLowerCase() || '';
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || groupCode.includes(searchTerm.toLowerCase());
    
    const planStatus = calculatePlanStatus(plan);
    const matchesStatus = statusFilter === 'all' || planStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: plans.length,
    fullyPaid: plans.filter(p => calculatePlanStatus(p) === 'Fully Paid').length,
    inProgress: plans.filter(p => calculatePlanStatus(p) === 'In Progress').length,
    overdue: plans.filter(p => calculatePlanStatus(p) === 'Overdue').length
  };

  if (loading) return <div className="p-8 text-gray-900">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Plans Management</h1>
          <p className="text-gray-700">Manage student payment plans and installments</p>
        </div>
        <button
          onClick={handleCreatePlan}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          + Create Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Total Plans</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Fully Paid</p>
          <p className="text-3xl font-bold text-gray-900">{stats.fullyPaid}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
          <p className="text-sm font-medium text-gray-700 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Overdue</p>
          <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by student name or group code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="In Progress">In Progress</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Installments</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Final Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlans.map((plan) => {
                const paidAmount = calculatePaidAmount(plan);
                const remaining = Number(plan.finalAmount) - paidAmount;
                const status = calculatePlanStatus(plan);
                const totalInstallments = plan.installments?.length || 0;
                const paidInstallments = plan.installments?.filter((inst: any) => inst.paymentDate !== null).length || 0;

                return (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {plan.enrollment?.student?.firstName} {plan.enrollment?.student?.secondName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{plan.enrollment?.group?.groupCode || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        paidInstallments === totalInstallments ? 'bg-green-100 text-green-800' :
                        paidInstallments > 0 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {paidInstallments}/{totalInstallments}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{Number(plan.totalAmount).toFixed(2)} BD</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{Number(plan.discountAmount || 0).toFixed(2)} BD</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{Number(plan.finalAmount).toFixed(2)} BD</td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">{paidAmount.toFixed(2)} BD</td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">{remaining.toFixed(2)} BD</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'Fully Paid' ? 'bg-green-100 text-green-800' :
                        status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewInstallments(plan)}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(plan)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlans.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-600">No payment plans found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Payment Plan</h2>
            <p className="text-sm text-gray-600 mb-4">
              Student: <strong>{selectedPlan?.enrollment?.student?.firstName} {selectedPlan?.enrollment?.student?.secondName}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Total Amount (BD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalAmount}
                  onChange={(e) => setEditForm({...editForm, totalAmount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Discount Amount (BD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.discountAmount}
                  onChange={(e) => setEditForm({...editForm, discountAmount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Discount Reason</label>
                <input
                  type="text"
                  value={editForm.discountReason}
                  onChange={(e) => setEditForm({...editForm, discountReason: e.target.value})}
                  placeholder="e.g., Scholarship"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Final Amount:</strong> {(editForm.totalAmount - editForm.discountAmount).toFixed(2)} BD
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Plan
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Payment Plan</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Select Enrollment</label>
                <select
                  value={createForm.enrollmentId}
                  onChange={(e) => setCreateForm({...createForm, enrollmentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">-- Select Enrollment --</option>
                  {enrollments.map((enr: any) => (
                    <option key={enr.id} value={enr.id}>
                      {enr.student?.firstName} {enr.student?.secondName} - {enr.group?.groupCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Total Amount (BD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.totalAmount}
                    onChange={(e) => setCreateForm({...createForm, totalAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Discount Amount (BD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.discountAmount}
                    onChange={(e) => setCreateForm({...createForm, discountAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Discount Reason</label>
                <input
                  type="text"
                  value={createForm.discountReason}
                  onChange={(e) => setCreateForm({...createForm, discountReason: e.target.value})}
                  placeholder="e.g., Scholarship, Early Bird"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Number of Installments</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={createForm.totalInstallments}
                  onChange={(e) => setCreateForm({...createForm, totalInstallments: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generateInstallments}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Installments
                </button>
              </div>

              {createForm.installments.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Generated Installments:</h3>
                  <div className="max-h-48 overflow-y-auto border rounded p-2">
                    {createForm.installments.map((inst: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-1 text-sm">
                        <span>Installment #{inst.installmentNumber}</span>
                        <span>{inst.amount.toFixed(2)} BD - Due: {inst.paymentDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Final Amount:</strong> {(createForm.totalAmount - createForm.discountAmount).toFixed(2)} BD
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitCreate}
                disabled={createForm.installments.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Create Plan
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Installments Modal */}
      {showInstallmentsModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl my-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Installments - {selectedPlan.enrollment?.student?.firstName} {selectedPlan.enrollment?.student?.secondName}
              </h2>
              <button
                onClick={() => setShowAddInstallment(!showAddInstallment)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                + Add Installment
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold ml-2">{Number(selectedPlan.totalAmount).toFixed(2)} BD</span>
                </div>
                <div>
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold ml-2">{Number(selectedPlan.discountAmount || 0).toFixed(2)} BD</span>
                </div>
                <div>
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-semibold ml-2">{Number(selectedPlan.finalAmount).toFixed(2)} BD</span>
                </div>
              </div>
            </div>

            {/* Add Installment Form */}
            {showAddInstallment && (
              <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Installment</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Amount (BD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInstallment.amount}
                      onChange={(e) => setNewInstallment({...newInstallment, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newInstallment.dueDate}
                      onChange={(e) => setNewInstallment({...newInstallment, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleAddInstallment}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddInstallment(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">#</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Payment Date</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedPlan.installments?.map((inst: any) => {
                    let status = 'PENDING';
                    if (inst.paymentDate) {
                      status = 'PAID';
                    } else if (inst.dueDate && new Date(inst.dueDate) < new Date()) {
                      status = 'OVERDUE';
                    }

                    const isEditing = editingInstallmentId === inst.id;
                    const isPaid = inst.paymentDate !== null;

                    return (
                      <tr key={inst.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{inst.installmentNumber}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {isEditing && !isPaid ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingInstallment.amount}
                              onChange={(e) => setEditingInstallment({...editingInstallment, amount: parseFloat(e.target.value)})}
                              className="w-full px-2 py-1 border rounded text-right"
                            />
                          ) : (
                            `${Number(inst.amount).toFixed(2)} BD`
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          {isEditing && !isPaid ? (
                            <input
                              type="date"
                              value={editingInstallment.dueDate}
                              onChange={(e) => setEditingInstallment({...editingInstallment, dueDate: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '-'
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          {inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">{inst.paymentMethod || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            status === 'PAID' ? 'bg-green-100 text-green-800' :
                            status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            {!isPaid && (
                              isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveInstallment(inst.id)}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingInstallmentId(null)}
                                    className="px-2 py-1 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditInstallment(inst)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInstallment(inst.id)}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </>
                              )
                            )}
                            {isPaid && <span className="text-xs text-gray-500">Paid</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowInstallmentsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
