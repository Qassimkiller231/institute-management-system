import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any
});

export const createPaymentIntent = async (data: {
  amount: number; // in BHD
  currency: string;
  installmentId: string;
  studentEmail?: string;
}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 1000), // BHD to fils
    currency: data.currency.toLowerCase(),
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
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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