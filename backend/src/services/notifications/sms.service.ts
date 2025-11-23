/**
 * SMS service (placeholder - configure Twilio later)
 */

interface SMSData {
  to: string;
  message: string;
}

/**
 * Send SMS via Twilio (stub for now)
 */
export const sendSMS = async (data: SMSData): Promise<void> => {
  console.log('📱 SMS SENT (STUB):');
  console.log(`To: ${data.to}`);
  console.log(`Message: ${data.message}`);
  console.log('---');
  
  // TODO: Implement Twilio when ready
  // const twilio = require('twilio')(accountSid, authToken);
  // await twilio.messages.create({...});
  
  // For now, just log it
  return Promise.resolve();
};