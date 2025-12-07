// Test SNS email sending
import { sendOtpEmail } from './src/services/email.service';

async function testSNS() {
    console.log('🧪 Testing SNS Email Configuration...\n');

    console.log('📧 Sending test email via SNS...');
    console.log('   From:', process.env.EMAIL_FROM);
    console.log('   Topic ARN:', process.env.AWS_SNS_TOPIC_ARN);
    console.log('   Region:', process.env.AWS_SNS_REGION);

    try {
        const result = await sendOtpEmail({
            to: process.env.EMAIL_FROM || 'qassimahmed231@gmail.com',
            name: 'Test User (SNS)',
            otpCode: '654321',
            expiryMinutes: 10
        });

        console.log('\n✅ SNS Email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('\n📧 Check your email inbox!');
        console.log('   Subject: "Your OTP Code - Function Institute"');
        console.log('   OTP Code: 654321');

    } catch (error: any) {
        console.error('\n❌ SNS Email failed:', error.message);
        console.log('\nCommon issues:');
        console.log('   - AWS credentials not configured');
        console.log('   - Topic ARN incorrect');
        console.log('   - Email not subscribed to SNS topic');
        console.log('   - SNS topic not verified');
    }
}

testSNS().then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
