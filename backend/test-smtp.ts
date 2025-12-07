// Test SMTP email sending
import { sendOtpEmail, verifyEmailConfiguration } from './src/services/email.service';

async function testEmail() {
    console.log('🧪 Testing SMTP Email Configuration...\n');

    // Test 1: Verify SMTP connection
    console.log('1️⃣ Verifying SMTP connection...');
    const verification = await verifyEmailConfiguration();
    console.log(verification.success ? '✅ SMTP configured correctly!' : `❌ Error: ${verification.message}`);

    if (!verification.success) {
        console.log('\n❌ SMTP verification failed. Check your .env settings:');
        console.log('   - SMTP_HOST =', process.env.SMTP_HOST);
        console.log('   - SMTP_PORT =', process.env.SMTP_PORT);
        console.log('   - SMTP_USER =', process.env.SMTP_USER);
        console.log('   - SMTP_PASSWORD =', process.env.SMTP_PASSWORD ? '***SET***' : '***MISSING***');
        return;
    }

    console.log('\n2️⃣ Sending test OTP email...');

    try {
        const result = await sendOtpEmail({
            to: process.env.SMTP_USER!, // Send to yourself
            name: 'Test User',
            otpCode: '123456',
            expiryMinutes: 10
        });

        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('\n📧 Check your inbox:', process.env.SMTP_USER);
        console.log('   Subject: "Your OTP Code - Function Institute"');
        console.log('   OTP Code: 123456');

    } catch (error: any) {
        console.error('❌ Failed to send email:', error.message);
        console.log('\nCommon issues:');
        console.log('   - Wrong SMTP password (use app password, not regular password)');
        console.log('   - Gmail security settings blocking access');
        console.log('   - 2-factor authentication not enabled');
    }
}

testEmail().then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
});
