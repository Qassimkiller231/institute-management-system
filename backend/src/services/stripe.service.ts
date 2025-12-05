import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any
});

export const createPaymentIntent = async (data: {
  amount: number; // in BHD (but converted to USD for testing)
  currency: string;
  installmentId: string;
  studentEmail?: string;
}) => {
  // Use USD for test mode since BHD is not supported in Stripe test mode
  // In production, you would use 'bhd' and multiply by 1000 (fils)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100), // Convert to cents for USD (in test mode)
    currency: 'usd', // Use USD in test mode; change to 'bhd' in production
    metadata: {
      installmentId: data.installmentId,
    },
    receipt_email: data.studentEmail,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

export const confirmPayment = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });

  if (paymentIntent.status === 'succeeded') {
    return { success: true, paymentIntent };
  }

  throw new Error('Payment not completed');
};

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 1000) : undefined,
  });

  return refund;
};