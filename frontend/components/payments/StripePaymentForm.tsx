'use client';

import { useState, FormEvent } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsAPI } from '@/lib/api';

interface StripePaymentFormProps {
  installment: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePaymentForm({ installment, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create payment intent on backend
      const intentResponse = await paymentsAPI.createStripeIntent(
        installment.id,
        parseFloat(installment.amount),
        'BHD'
      );

      const { clientSecret } = intentResponse.data;

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Confirm payment on backend (records in database)
      await paymentsAPI.confirmStripePayment(paymentIntent!.id, installment.id);

      // Success!
      onSuccess();
    } catch (err: any) {
      // console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderPaymentHeader = () => (
    <div><h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3><p className="text-sm text-gray-600 mb-4">Amount: <strong>{parseFloat(installment.amount).toFixed(2)} BD</strong></p></div>
  );

  const renderCardInput = () => (
    <div><label className="block text-sm font-medium text-gray-900 mb-2">Card Information</label><div className="p-3 border border-gray-300 rounded-lg bg-white"><CardElement options={cardElementOptions} /></div></div>
  );

  const renderError = () => !error ? null : (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800">{error}</p></div>
  );

  const renderTestCardNotice = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><p className="text-xs text-blue-800">💳 <strong>Test Card:</strong> 4242 4242 4242 4242 | Any future date | Any CVC</p></div>
  );

  const renderActionButtons = () => (
    <div className="flex gap-3"><button type="submit" disabled={!stripe || loading} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold">{loading ? 'Processing...' : `Pay ${parseFloat(installment.amount).toFixed(2)} BD`}</button><button type="button" onClick={onCancel} disabled={loading} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100">Cancel</button></div>
  );

  const renderSecurityNotice = () => (
    <p className="text-xs text-gray-500 text-center">🔒 Payments are secure and encrypted. Your card details are never stored on our servers.</p>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderPaymentHeader()}
      {renderCardInput()}
      {renderError()}
      {renderTestCardNotice()}
      {renderActionButtons()}
      {renderSecurityNotice()}
    </form>
  );
}
