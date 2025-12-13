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
  try {
    console.log('🔍 Stripe.confirmPayment: Retrieving payment intent:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    console.log('✅ Payment intent retrieved. Status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment succeeded!');
      return { success: true, paymentIntent };
    }

    console.error('❌ Payment not succeeded. Status:', paymentIntent.status);
    throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
  } catch (error: any) {
    console.error('❌ Stripe confirmPayment error:');
    console.error('   Type:', error.type);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
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