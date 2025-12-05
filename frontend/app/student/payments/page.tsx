'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe/config';
import { getToken, getStudentId } from '@/lib/auth';
import { studentsAPI } from '@/lib/api';
import StripePaymentForm from '@/components/payments/StripePaymentForm';

interface Installment {
  id: string;
  installmentNumber: number;
  amount: string;
  dueDate: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

interface PaymentPlan {
  id: string;
  totalAmount: string;
  discountAmount: string;
  finalAmount: string;
  totalInstallments: number;
  status: string;
  installments: Installment[];
}

export default function StudentPaymentsPage() {
  const router = useRouter();
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canSeePayment, setCanSeePayment] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const studentId = getStudentId();

        if (!studentId) {
          router.push('/login');
          return;
        }

        // Get student to check canSeePayment
        const result = await studentsAPI.getById(studentId);
        const student = result.data || result;

        // Check if student can see payments
        if (!student.canSeePayment) {
          setCanSeePayment(false);
          setLoading(false);
          return;
        }

        // Get active enrollment
        const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ACTIVE');
        
        if (!activeEnrollment) {
          setPaymentPlan(null);
          setLoading(false);
          return;
        }

        // Fetch payment plan - FIXED ENDPOINT
        const paymentRes = await fetch(
          `http://localhost:3001/api/payments/plans/enrollment/${activeEnrollment.id}`,
          {
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          }
        );

        if (paymentRes.ok) {
          const paymentResponse = await paymentRes.json();
          const data = paymentResponse.data || paymentResponse;
          setPaymentPlan(data);
        } else {
          setPaymentPlan(null);
        }

      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router]);

  const formatCurrency = (amount: string) => {
    return `${parseFloat(amount).toFixed(3)} BHD`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '-';
    const methods: { [key: string]: string } = {
      'BENEFIT_PAY': 'BenefitPay',
      'BANK_TRANSFER': 'Bank Transfer',
      'CASH': 'Cash',
      'CARD_MACHINE': 'Card Machine',
      'ONLINE_PAYMENT': 'Online Payment'
    };
    return methods[method] || method;
  };

  const isPaid = (installment: Installment) => {
    return !!installment.paymentDate;
  };

  const isOverdue = (installment: Installment) => {
    if (isPaid(installment) || !installment.dueDate) return false;
    return new Date(installment.dueDate) < new Date();
  };

  const getInstallmentStatus = (installment: Installment) => {
    if (isPaid(installment)) {
      return { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (isOverdue(installment)) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  };

  const handlePayNow = (installment: Installment) => {
    setSelectedInstallment(installment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedInstallment(null);
    alert('Payment successful! 🎉 Your payment has been recorded.');
    window.location.reload(); // Refresh to show updated payment status
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-4 h-32"></div>
            <div className="bg-white rounded-lg shadow p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!canSeePayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => router.push('/student')}
              className="mb-4 text-gray-300 hover:text-white flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-2">Payments</h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800 text-lg">
              Payment information is managed by your parent/guardian. Please contact them for payment details.
            </p>
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
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Payments</h2>
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

  if (!paymentPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => router.push('/student')}
              className="mb-4 text-emerald-100 hover:text-white flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold mb-2">Payments</h1>
            <p className="text-emerald-100">View your payment plan and history</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No payment plan found for your current enrollment.</p>
          </div>
        </div>
      </div>
    );
  }

  const paidInstallments = paymentPlan.installments.filter(isPaid).length;
  const totalPaid = paymentPlan.installments
    .filter(isPaid)
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const remaining = parseFloat(paymentPlan.finalAmount) - totalPaid;
  const progressPercentage = (totalPaid / parseFloat(paymentPlan.finalAmount)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/student')}
            className="mb-4 text-emerald-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Payments</h1>
          <p className="text-emerald-100">View your payment plan and history</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Payment Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentPlan.totalAmount)}</p>
              {parseFloat(paymentPlan.discountAmount) > 0 && (
                <p className="text-sm text-green-600">
                  Discount: {formatCurrency(paymentPlan.discountAmount)}
                </p>
              )}
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid.toFixed(3))}</p>
              <p className="text-sm text-gray-600">
                {paidInstallments} of {paymentPlan.totalInstallments} installments
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(remaining.toFixed(3))}</p>
              <p className="text-sm text-gray-600">
                {paymentPlan.totalInstallments - paidInstallments} installments left
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Progress</span>
              <span className="text-sm font-semibold text-gray-900">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {progressPercentage === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-semibold text-green-800">Payment Complete!</p>
                <p className="text-green-700 text-sm">All installments have been paid.</p>
              </div>
            </div>
          )}
        </div>

        {/* Installments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Installment Schedule</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentPlan.installments
                  .sort((a, b) => a.installmentNumber - b.installmentNumber)
                  .map((installment) => {
                    const status = getInstallmentStatus(installment);
                    return (
                      <tr key={installment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {installment.installmentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatCurrency(installment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(installment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getPaymentMethodLabel(installment.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {installment.receiptUrl ? (
                            <a 
                              href={installment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              View
                            </a>
                          ) : installment.receiptNumber ? (
                            <span className="text-gray-500">{installment.receiptNumber}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {!isPaid(installment) && (
                            <button
                              onClick={() => handlePayNow(installment)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-semibold"
                            >
                              💳 Pay Now
                            </button>
                          )}
                          {isPaid(installment) && (
                            <span className="text-green-600 text-sm font-semibold">✓ Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💳 Online Payments:</strong> You can pay your installments securely online using a credit/debit card. Click "Pay Now" on any pending installment to get started.
          </p>
          <p className="text-sm text-blue-800 mt-2">
            <strong>Note:</strong> For other payment methods or inquiries, please contact the administration office.
          </p>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {showPaymentModal && selectedInstallment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pay Installment #{selectedInstallment.installmentNumber}
            </h2>
            <p className="text-gray-600 mb-6">
              Make a secure payment using your credit or debit card
            </p>
            
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                installment={{
                  id: selectedInstallment.id,
                  amount: selectedInstallment.amount
                }}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}