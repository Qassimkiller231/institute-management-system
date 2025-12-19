/**
 * SMS service (placeholder - configure Twilio later)
 */

interface SMSData {
  to: string;
  message: string;
}

const TEST_MODE = process.env.NOTIFICATION_TEST_MODE === 'true';
const TEST_PHONE = process.env.NOTIFICATION_TEST_PHONE || '';

/**
 * Send SMS via Twilio (stub for now)
 */
export const sendSMS = async (data: SMSData): Promise<void> => {
  // Override recipient in test mode
  const recipient = TEST_MODE && TEST_PHONE ? TEST_PHONE : data.to;

  console.log('📱 SMS SENT' + (TEST_MODE ? ' (TEST MODE)' : '') + ':');
  console.log(`To: ${recipient}`);
  console.log(`Message: ${data.message}`);
  console.log('---');

  // TODO: Implement Twilio when ready
  // const twilio = require('twilio')(accountSid, authToken);
  // await twilio.messages.create({...});

  // For now, just log it
  return Promise.resolve();
};