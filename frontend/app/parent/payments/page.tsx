'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe/config';
import StripePaymentForm from '@/components/payments/StripePaymentForm';
import { getToken } from '@/lib/authStorage';
import { paymentsAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';

// ========================================
// TYPES
// ========================================

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  dueDate?: string;
  paidDate?: string;
  student?: {
    id: string;
    firstName: string;
    secondName?: string;
    thirdName?: string;
  };
}

type FilterType = 'all' | 'COMPLETED' | 'PENDING' | 'FAILED';

export default function ParentPaymentsPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Load payments on mount
   */
  useEffect(() => {
    fetchPayments();
  }, []);

  // ========================================
  // DATA LOADING
  // ========================================
  
  /**
   * Fetch all payments from API
   */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await paymentsAPI.getPayments();
      setPayments(data.data || []);
    } catch (err: any) {
      // console.error('Error loading payments:', err); // Debug
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Filter payments based on status
   */
  const getFilteredPayments = (): Payment[] => {
    return payments.filter(p => {
      if (filter === 'all') return true;
      if (!p.status) return false;
      return p.status.toUpperCase() === filter;
    });
  };

  /**
   * Get color class for payment status
   */
  const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Calculate total paid amount
   */
  const getTotalPaid = (): number => {
    return payments
      .filter(p => p.status?.toUpperCase() === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  };

  /**
   * Calculate total pending amount
   */
  const getTotalPending = (): number => {
    return payments
      .filter(p => p.status && ['PENDING', 'OVERDUE'].includes(p.status.toUpperCase()))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  };

  // ========================================
  // HANDLERS
  // ========================================
  
  /**
   * Handle payment initiation
   */
  const handleMakePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    // Could show a toast notification instead of alert
    // alert('Payment successful! 🎉 Your payment has been recorded.');
    fetchPayments();
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render header
   */
  const renderHeader = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments</h2>
        <p className="text-gray-600 mb-4">View payment history and make new payments</p>
      </div>
    );
  };

  /**
   * Render individual stat card
   */
  const renderStatCard = (label: string, value: string, icon: string, colorClass: string) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${colorClass}`}>
              {value}
            </p>
          </div>
          <div className={`${colorClass.replace('text-', 'bg-').replace('-600', '-100')} p-3 rounded-full`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render stats cards section
   */
  const renderStatsCards = () => {
    const totalPaid = getTotalPaid();
    const totalPending = getTotalPending();

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {renderStatCard('Total Paid', `$${totalPaid.toFixed(2)}`, '✓', 'text-green-600')}
        {renderStatCard('Pending', `$${totalPending.toFixed(2)}`, '⏱', 'text-yellow-600')}
        {renderStatCard('Total Payments', String(payments.length), '💳', 'text-gray-900')}
      </div>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilters = () => {
    const filters: FilterType[] = ['all', 'COMPLETED', 'PENDING', 'FAILED'];

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
        <p className="text-gray-600">
          {payments.length === 0 
            ? 'No payment history available.'
            : 'No payments match your filter.'}
        </p>
      </div>
    );
  };

  /**
   * Render payment table row
   */
  const renderPaymentRow = (payment: Payment) => {
    return (
      <tr key={payment.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {new Date(payment.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {payment.description || 'Payment'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {payment.student 
            ? `${payment.student.firstName} ${payment.student.secondName || ''}`.trim()
            : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
          {payment.currency || '$'}{(Number(payment.amount) || 0).toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.status)}`}>
            {payment.status || 'Unknown'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {payment.status && payment.status.toUpperCase() === 'PAID' ? (
            <span className="text-green-600 font-medium">✓ Paid</span>
          ) : (
            <button
              onClick={() => handleMakePayment(payment)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Pay Now
            </button>
          )}
        </td>
      </tr>
    );
  };

  /**
   * Render payments table
   */
  const renderPaymentsTable = () => {
    const filteredPayments = getFilteredPayments();

    if (filteredPayments.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => renderPaymentRow(payment))}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Render Stripe payment modal
   */
  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pay: {selectedPayment.description}
          </h2>
          <p className="text-gray-600 mb-4">
            Student: {selectedPayment.student 
              ? `${selectedPayment.student.firstName} ${selectedPayment.student.secondName || ''}`.trim()
              : 'N/A'}
          </p>
          <p className="text-gray-600 mb-6">
            Make a secure payment using your credit or debit card
          </p>
          
          <Elements stripe={stripePromise}>
            <StripePaymentForm 
              installment={{
                id: selectedPayment.id,
                amount: selectedPayment.amount.toString()
              }}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentModal(false)}
            />
          </Elements>
        </div>
      </div>
    );
  };

  /**
   * Render main payments page
   */
  const renderPaymentsPage = () => {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderStatsCards()}
        {renderFilters()}
        {renderPaymentsTable()}
        {renderPaymentModal()}
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading payments..." />;
  }

  return renderPaymentsPage();
}
