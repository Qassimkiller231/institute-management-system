// Quick OTP Test Script
// Run this with: node --loader tsx test-otp.ts

import * as smsService from './src/services/sms.service';

async function testOTP() {
  console.log('🧪 Testing Twilio OTP...\n');

  // Replace with your phone number
  const testPhoneNumber = '+97339123456'; // Change this to your Bahraini number
  const testCode = '123456';

  try {
    console.log('📱 Sending OTP to:', testPhoneNumber);
    
    const result = await smsService.sendOTP({
      phone: testPhoneNumber,
      code: testCode
    });

    console.log('✅ Success!');
    console.log('Message SID:', result.messageSid);
    console.log('Status:', result.status);
    console.log('\n📬 Check your phone for the SMS!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testOTP();
