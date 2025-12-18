'use client';

import { useState, useEffect } from 'react';
import { paymentsAPI, groupsAPI, programsAPI, termsAPI } from '@/lib/api';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'BENEFIT_PAY',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    benefitReference: '',
    notes: ''
  });

  // Filter options
  const [groups, setGroups] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [groupsRes, programsRes, termsRes] = await Promise.all([
        groupsAPI.getAll(),
        programsAPI.getAll(),
        termsAPI.getAll()
      ]);

      // console.log('🔍 [ADMIN PAYMENTS DEBUG] Filter data responses:', { groupsRes, programsRes, termsRes });

      // Handle nested data structures - termsAPI returns { data: { data: [...] } }
      const groupsData = Array.isArray(groupsRes?.data) ? groupsRes.data : [];
      const programsData = Array.isArray(programsRes?.data) ? programsRes.data : [];
      const termsData = Array.isArray(termsRes?.data?.data) ? termsRes.data.data :
        Array.isArray(termsRes?.data) ? termsRes.data : [];

      // console.log('✅ [ADMIN PAYMENTS DEBUG] Extracted arrays:', { 
      //   groups: groupsData.length, 
      //   programs: programsData.length, 
      //   terms: termsData.length 
      // });

      setGroups(groupsData);
      setPrograms(programsData);
      setTerms(termsData);
    } catch (err) {
      console.error('❌ [ADMIN PAYMENTS DEBUG] Error loading filter data:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAllPlans();

      // Transform data from payment plans to installments list
      const installmentsList: any[] = [];

      if (response.data) {
        response.data.forEach((plan: any) => {
          plan.installments?.forEach((inst: any) => {
            // Determine status based on payment date and due date
            let status = 'PENDING';
            if (inst.paymentDate) {
              status = 'PAID';
            } else if (inst.dueDate && new Date(inst.dueDate) < new Date()) {
              status = 'OVERDUE';
            }

            installmentsList.push({
              id: inst.id,
              studentName: `${plan.enrollment?.student?.firstName || ''} ${plan.enrollment?.student?.secondName || ''}`.trim(),
              groupCode: plan.enrollment?.group?.groupCode || 'N/A',
              installmentNumber: inst.installmentNumber,
              amount: parseFloat(inst.amount),
              dueDate: inst.dueDate ? new Date(inst.dueDate).toISOString().split('T')[0] : null,
              paymentDate: inst.paymentDate ? new Date(inst.paymentDate).toISOString().split('T')[0] : null,
              status,
              paymentMethod: inst.paymentMethod,
              receiptNumber: inst.receiptNumber,
              receiptUrl: inst.receiptUrl
            });
          });
        });
      }

      setPayments(installmentsList);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = (payment: any) => {
    setSelectedPayment(payment);
    setPaymentForm({
      paymentMethod: 'BENEFIT_PAY',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      benefitReference: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };



  const submitPayment = async () => {
    try {
      await paymentsAPI.recordPayment(selectedPayment.id, paymentForm);
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      fetchPayments(); // Refresh the list
    } catch (err: any) {
      alert('Error recording payment: ' + err.message);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.groupCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesGroup = groupFilter === 'all' || payment.groupCode === groupFilter;

    // For program filter, we need to check if the group belongs to that program
    let matchesProgram = true;
    if (programFilter !== 'all') {
      const group = groups.find(g => g.groupCode === payment.groupCode);
      matchesProgram = group?.term?.programId === programFilter;
    }

    // For term filter, we need to check if the group belongs to that term
    let matchesTerm = true;
    if (termFilter !== 'all') {
      const group = groups.find(g => g.groupCode === payment.groupCode);
      matchesTerm = group?.termId === termFilter;
    }

    return matchesSearch && matchesStatus && matchesGroup && matchesProgram && matchesTerm;
  });

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'PAID').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    overdue: payments.filter(p => p.status === 'OVERDUE').length,
  };

  const handleViewReceipt = (payment: any) => {
    // Always use the internal modal for consistency, as requested
    setReceiptData(payment);
    setShowReceiptModal(true);
  };

  const renderReceiptModal = () => {
    if (!receiptData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-[#3e445b] p-8 text-center text-white shrink-0">
            <h2 className="text-xl font-semibold mb-2">Receipt from Function Institute</h2>
            <p className="text-white/70 text-sm">Receipt #{receiptData.receiptNumber || 'PENDING'}</p>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto">
            {/* Amount Section */}
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount Paid</p>
              <p className="text-4xl font-bold text-gray-900">{receiptData.amount.toFixed(2)} BD</p>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Paid</p>
                <p className="text-gray-900">{receiptData.paymentDate || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                <p className="text-gray-900">{receiptData.paymentMethod?.replace(/_/g, ' ') || '-'}</p>
              </div>
            </div>

            {/* Summary Information */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student</span>
                  <span className="font-medium text-gray-900">{receiptData.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Installment #{receiptData.installmentNumber}</span>
                  <span className="font-medium text-gray-900">{receiptData.amount.toFixed(2)} BD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Group Code</span>
                  <span className="font-medium text-gray-900">{receiptData.groupCode}</span>
                </div>
                {/* Divider */}
                <div className="border-t border-gray-200 my-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-bold text-gray-900">{receiptData.amount.toFixed(2)} BD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center shrink-0">
            <p className="text-sm text-gray-500 mb-4">
              If you have any questions, contact us at <br />
              <span className="text-blue-600">support@functioninstitute.com</span>
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {receiptData.receiptUrl && (
                <a
                  href={receiptData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Original
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderLoadingState = () => <div className="p-8 text-gray-900">Loading...</div>;

  const renderHeader = () => (
    <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Payments Management</h1><p className="text-gray-700">View and manage student payments and installments</p></div>
  );

  const renderStats = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-6"><div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"><p className="text-sm font-medium text-gray-700 mb-1">Total Installments</p><p className="text-3xl font-bold text-gray-900">{stats.total}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"><p className="text-sm font-medium text-gray-700 mb-1">Paid</p><p className="text-3xl font-bold text-gray-900">{stats.paid}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600"><p className="text-sm font-medium text-gray-700 mb-1">Pending</p><p className="text-3xl font-bold text-gray-900">{stats.pending}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600"><p className="text-sm font-medium text-gray-700 mb-1">Overdue</p><p className="text-3xl font-bold text-gray-900">{stats.overdue}</p></div></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6"><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><input type="text" placeholder="Search by student name or group code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div><div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Status</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="OVERDUE">Overdue</option></select></div></div><div className="grid md:grid-cols-3 gap-4 mt-4"><div><select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Programs</option>{programs.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div><div><select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Terms</option>{terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}</select></div><div><select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Groups</option>{groups.map(group => <option key={group.id} value={group.groupCode}>{group.groupCode}</option>)}</select></div></div></div>
  );

  const renderTableRow = (payment: any) => (
    <tr key={payment.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.studentName}</td><td className="px-6 py-4 text-sm text-gray-900">{payment.groupCode}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{payment.installmentNumber}</td><td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{payment.amount.toFixed(2)} BD</td><td className="px-6 py-4 text-sm text-center text-gray-900">{payment.dueDate}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{payment.paymentDate || '-'}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{payment.paymentMethod || '-'}</td><td className="px-6 py-4 text-center"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{payment.status}</span></td><td className="px-6 py-4 text-center"><div className="flex justify-center gap-2">{payment.status !== 'PAID' && <button onClick={() => handleRecordPayment(payment)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Record Payment</button>}{payment.status === 'PAID' && <button onClick={() => handleViewReceipt(payment)} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">View Receipt</button>}</div></td></tr>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Group</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Installment #</th><th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Due Date</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Payment Date</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Method</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredPayments.map(renderTableRow)}</tbody></table></div>{filteredPayments.length === 0 && <div className="p-12 text-center"><p className="text-gray-600">No payments found</p></div>}</div>
  );

  const renderRecordPaymentModal = () => !showPaymentModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-full max-w-md"><h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2><p className="text-sm text-gray-600 mb-4">Student: <strong>{selectedPayment?.studentName}</strong><br />Amount: <strong>{selectedPayment?.amount.toFixed(2)} BD</strong></p><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-900 mb-1">Payment Method</label><select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="BENEFIT_PAY">Benefit Pay</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CASH">Cash</option><option value="CARD_MACHINE">Card Machine</option><option value="ONLINE_PAYMENT">Online Payment</option></select></div><div><label className="block text-sm font-medium text-gray-900 mb-1">Payment Date</label><input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" /></div><div><label className="block text-sm font-medium text-gray-900 mb-1">Receipt Number</label><input type="text" value={paymentForm.receiptNumber} onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })} placeholder="REC-2025-XXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>{paymentForm.paymentMethod === 'BENEFIT_PAY' && <div><label className="block text-sm font-medium text-gray-900 mb-1">Benefit Reference</label><input type="text" value={paymentForm.benefitReference} onChange={(e) => setPaymentForm({ ...paymentForm, benefitReference: e.target.value })} placeholder="BEN-2025-XXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" /></div>}<div><label className="block text-sm font-medium text-gray-900 mb-1">Notes (Optional)</label><textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" /></div></div><div className="flex gap-3 mt-6"><button onClick={submitPayment} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Record Payment</button><button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancel</button></div></div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) return renderLoadingState();

  return (
    <div>
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderTable()}
      {renderRecordPaymentModal()}
      {showReceiptModal && renderReceiptModal()}
    </div>
  );
}
