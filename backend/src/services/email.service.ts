// src/services/email.service.ts
import { PrismaClient } from '@prisma/client';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// Email provider configuration
const USE_SNS = process.env.USE_SNS === 'true';

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// SNS client
const snsClient = new SNSClient({
  region: process.env.AWS_SNS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  } : undefined,
});

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@institute.com';
const SNS_TOPIC_ARN = process.env.AWS_SNS_TOPIC_ARN;

// Send via SNS
const sendViaSNS = async (data: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}) => {
  if (!SNS_TOPIC_ARN) {
    throw new Error('AWS_SNS_TOPIC_ARN not configured');
  }

  const message = data.textBody || data.htmlBody.replace(/<[^>]*>/g, '');

  const command = new PublishCommand({
    TopicArn: SNS_TOPIC_ARN,
    Subject: data.subject,
    Message: message,
  });

  const result = await snsClient.send(command);
  return { success: true, messageId: result.MessageId };
};

// Send via SMTP
const sendViaSMTP = async (data: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}) => {
  const info = await transporter.sendMail({
    from: `"Function Institute" <${FROM_EMAIL}>`,
    to: data.to,
    subject: data.subject,
    text: data.textBody,
    html: data.htmlBody,
  });

  return { success: true, messageId: info.messageId };
};

// Main send email function with fallback
export const sendEmail = async (data: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}) => {
  // DEV OVERRIDE
  if (process.env.NODE_ENV !== 'production') {
    console.log(`⚠️ DEV MODE: Redirecting email from ${data.to} to qassimahmed231@gmail.com`);
    data.to = 'qassimahmed231@gmail.com';
  }

  try {
    if (USE_SNS) {
      console.log('📧 Sending via SNS...');
      const result = await sendViaSNS(data);
      console.log('✅ SNS sent:', result.messageId);
      return result;
    } else {
      console.log('📧 Sending via SMTP...');
      const result = await sendViaSMTP(data);
      console.log('✅ SMTP sent:', result.messageId);
      return result;
    }
  } catch (error: any) {
    console.error(`❌ ${USE_SNS ? 'SNS' : 'SMTP'} failed:`, error.message);

    // Try fallback
    if (USE_SNS) {
      console.log('🔄 Falling back to SMTP...');
      try {
        const result = await sendViaSMTP(data);
        console.log('✅ SMTP fallback succeeded:', result.messageId);
        return result;
      } catch (smtpError: any) {
        throw new Error(`Both SNS and SMTP failed. SNS: ${error.message}, SMTP: ${smtpError.message}`);
      }
    } else {
      console.log('🔄 Falling back to SNS...');
      try {
        const result = await sendViaSNS(data);
        console.log('✅ SNS fallback succeeded:', result.messageId);
        return result;
      } catch (snsError: any) {
        throw new Error(`Both SMTP and SNS failed. SMTP: ${error.message}, SNS: ${snsError.message}`);
      }
    }
  }
};

export const sendOtpEmail = async (data: {
  to: string;
  name: string;
  otpCode: string;
  expiryMinutes: number;
}) => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
        <h1>Function Institute</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hello ${data.name},</p>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #3498db; text-align: center; padding: 20px; background: white; border-radius: 5px;">
          ${data.otpCode}
        </div>
        <p><strong>Expires in ${data.expiryMinutes} minutes.</strong></p>
        <p>If you did not request this, please ignore.</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `Hello ${data.name},\nYour OTP: ${data.otpCode}\nExpires in ${data.expiryMinutes} minutes.\n- Function Institute`;

  return await sendEmail({
    to: data.to,
    subject: 'Your OTP Code - Function Institute',
    htmlBody,
    textBody,
  });
};

export const sendPaymentReceiptEmail = async (data: {
  to: string;
  studentName: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: Date;
  installmentNumber: number;
  balance: number;
}) => {
  const formattedDate = data.paymentDate.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333333; margin: 0; padding: 0; background-color: #f7f9fa; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #3e445b; padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .receipt-info { text-align: center; color: #8792a2; font-size: 14px; margin-top: 10px; }
        .content { padding: 40px; }
        .amount-section { text-align: center; margin-bottom: 40px; }
        .label { color: #8792a2; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px; }
        .amount { font-size: 36px; font-weight: 700; color: #333333; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
        .grid-item { text-align: left; }
        .summary-card { background-color: #f7f9fa; border-radius: 8px; padding: 24px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .summary-row.total { font-weight: 700; font-size: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e3e8ee; margin-bottom: 0; }
        .footer { padding: 30px; text-align: center; font-size: 13px; color: #8792a2; background-color: #f7f9fa; border-top: 1px solid #e3e8ee; }
        .footer a { color: #5469d4; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
           <h1>Receipt from Function Institute</h1>
           <div class="receipt-info">Receipt #${data.receiptNumber}</div>
        </div>
        
        <div class="content">
            <div class="amount-section">
                <div class="label">Amount Paid</div>
                <div class="amount">${data.currency} ${data.amount.toFixed(2)}</div>
            </div>

            <div class="grid">
                <div class="grid-item">
                    <div class="label">Date Paid</div>
                    <div>${formattedDate}</div>
                </div>
                <div class="grid-item">
                    <div class="label">Payment Method</div>
                    <div>${data.paymentMethod.replace('_', ' ')}</div>
                </div>
            </div>

            <div class="label">Summary</div>
            <div class="summary-card">
                <div class="summary-row">
                    <span>Student</span>
                    <span>${data.studentName}</span>
                </div>
                <div class="summary-row">
                    <span>Installment #${data.installmentNumber}</span>
                    <span>${data.currency} ${data.amount.toFixed(2)}</span>
                </div>
                 <div class="summary-row">
                    <span>Remaining Balance</span>
                    <span>${data.currency} ${data.balance.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Amount Paid</span>
                    <span>${data.currency} ${data.amount.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>If you have any questions, contact us at <br>
            <a href="mailto:support@functioninstitute.com">support@functioninstitute.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `Receipt from Function Institute\nReceipt #${data.receiptNumber}\n\nAmount Paid: ${data.currency} ${data.amount.toFixed(2)}\nDate: ${formattedDate}\nMethod: ${data.paymentMethod}\n\nStudent: ${data.studentName}\nInstallment #${data.installmentNumber}\nBalance: ${data.currency} ${data.balance.toFixed(2)}`;

  // DEV OVERRIDE (Already handled in main sendEmail if configured, but keeping logic consistent)

  return await sendEmail({
    to: data.to,
    subject: `Receipt #${data.receiptNumber}`,
    htmlBody,
    textBody,
  });
};

export const sendPaymentReminderEmail = async (data: {
  to: string;
  studentName: string;
  amount: number;
  currency: string;
  dueDate: Date;
  installmentNumber: number;
  reminderType: 'THREE_DAYS' | 'ONE_DAY' | 'DUE_DATE' | 'OVERDUE';
}) => {
  const messages = {
    THREE_DAYS: { subject: 'Payment Due in 3 Days', urgency: 'Upcoming', bg: '#f39c12' },
    ONE_DAY: { subject: 'Payment Due Tomorrow', urgency: 'Due Soon', bg: '#f39c12' },
    DUE_DATE: { subject: 'Payment Due Today', urgency: 'Due Today', bg: '#f39c12' },
    OVERDUE: { subject: 'URGENT: Overdue Payment', urgency: '⚠️ OVERDUE', bg: '#e74c3c' },
  };

  const msg = messages[data.reminderType];

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: ${msg.bg}; color: white; padding: 20px; text-align: center;">
        <h1>${msg.urgency}</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${data.studentName},</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background: white;">
          ${data.currency} ${data.amount.toFixed(2)}
        </div>
        <p>Installment #${data.installmentNumber} - Due: ${data.dueDate.toLocaleDateString()}</p>
        <p><strong>Payment methods:</strong> Benefit Pay, Bank Transfer, Cash, Card Machine</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `${msg.urgency}\nAmount: ${data.currency} ${data.amount.toFixed(2)}\nDue: ${data.dueDate.toLocaleDateString()}`;

  return await sendEmail({
    to: data.to,
    subject: `${msg.subject} - Function Institute`,
    htmlBody,
    textBody,
  });
};

export const sendAttendanceWarningEmail = async (data: {
  to: string;
  studentName: string;
  attendancePercentage: number;
  classesAttended: number;
  totalClasses: number;
  groupName: string;
  recipientType: 'STUDENT' | 'PARENT';
}) => {
  const recipient = data.recipientType === 'STUDENT' ? data.studentName : `Parent of ${data.studentName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
        <h1>⚠️ Attendance Warning</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${recipient},</p>
        <div style="text-align: center; padding: 20px; background: white;">
          <div style="font-size: 48px; font-weight: bold; color: #e74c3c;">${data.attendancePercentage.toFixed(1)}%</div>
          <p>${data.classesAttended}/${data.totalClasses} classes - ${data.groupName}</p>
        </div>
        <p><strong>⚠️ Minimum Required: 75%</strong></p>
        <p>Action required: Ensure regular attendance to remaining classes.</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `ATTENDANCE WARNING\n${data.attendancePercentage.toFixed(1)}% (${data.classesAttended}/${data.totalClasses})\nMinimum: 75%`;

  return await sendEmail({
    to: data.to,
    subject: '⚠️ Attendance Warning - Function Institute',
    htmlBody,
    textBody,
  });
};

export const sendAnnouncementEmail = async (data: {
  to: string;
  recipientName: string;
  title: string;
  content: string;
  publishedBy: string;
}) => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #3498db; color: white; padding: 20px; text-align: center;">
        <h1>📢 Announcement</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${data.recipientName},</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #3498db;">
          <h2>${data.title}</h2>
          <p>${data.content}</p>
        </div>
        <p><em>Posted by: ${data.publishedBy}</em></p>
      </div>
    </body>
    </html>
  `;

  const textBody = `ANNOUNCEMENT\n${data.title}\n\n${data.content}\n\nPosted by: ${data.publishedBy}`;

  return await sendEmail({
    to: data.to,
    subject: `Announcement: ${data.title}`,
    htmlBody,
    textBody,
  });;
};

export const sendSpeakingBookingConfirmation = async (data: {
  to: string;
  studentName: string;
  teacherEmail: string;
  slotDate: Date;
  slotTime: string;
}) => {
  const formattedDate = data.slotDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(`2000-01-01T${data.slotTime}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #27ae60; color: white; padding: 20px; text-align: center;">
        <h1>✓ Speaking Test Booked!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${data.studentName},</p>
        <p>Your speaking test appointment has been successfully scheduled.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
              <td style="padding: 8px 0;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Teacher:</strong></td>
              <td style="padding: 8px 0;">${data.teacherEmail}</td>
            </tr>
          </table>
        </div>

        <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
          <p style="margin: 0;"><strong>📝 What to bring:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Student ID</li>
            <li>Confidence and a positive attitude!</li>
          </ul>
        </div>

        <p>If you need to reschedule, please log in to your account.</p>
        <p>Good luck with your speaking test!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          - Function Institute Team
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `Speaking Test Booked!

Dear ${data.studentName},

Your speaking test has been scheduled:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Teacher: ${data.teacherEmail}

What to bring:
- Student ID
- Confidence and a positive attitude!

Good luck!
- Function Institute`;

  return await sendEmail({
    to: data.to,
    subject: 'Speaking Test Confirmation - Function Institute',
    htmlBody,
    textBody,
  });
};

export const sendPlacementTestCompletionEmail = async (data: {
  to: string;
  studentName: string;
  assessedLevel: string;
  scorePercent: number;
  totalPoints: number;
  earnedPoints: number;
}) => {
  const levelColors: Record<string, string> = {
    'A1': '#e74c3c',
    'A2': '#e67e22',
    'B1': '#f39c12',
    'B2': '#2ecc71',
    'C1': '#3498db',
    'C2': '#9b59b6'
  };

  const levelColor = levelColors[data.assessedLevel] || '#3498db';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #3e445b; color: white; padding: 30px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
        <h1 style="margin: 0;">Test Completed Successfully!</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${data.studentName},</p>
        <p>Congratulations on completing your placement test! Here are your results:</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <div style="color: #666; font-size: 14px; margin-bottom: 10px;">YOUR ASSESSED LEVEL</div>
          <div style="background: ${levelColor}; color: white; font-size: 48px; font-weight: bold; border-radius: 12px; padding: 20px; display: inline-block; min-width: 100px;">
            ${data.assessedLevel}
          </div>
          <div style="margin-top: 15px; color: #666;">
            Score: ${data.earnedPoints}/${data.totalPoints} (${data.scorePercent.toFixed(1)}%)
          </div>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">📋 Processing Your Results</h3>
          <p style="margin: 0; color: #856404;">Thank you for completing the placement test! Our team is currently reviewing your results and preparing your detailed report.</p>
        </div>

        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0c5460;">📧 Next Steps</h3>
          <p style="color: #0c5460; margin: 5px 0;">You will receive a detailed report shortly via email which includes:</p>
          <ul style="color: #0c5460; margin: 10px 0;">
            <li>✓ Detailed performance report</li>
            <li>✓ Class schedule and enrollment details</li>
            <li>✓ Payment information</li>
            <li>✓ Access to learning materials</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
          <p style="margin: 0 0 15px 0; color: #666;">Need help? Contact us at</p>
          <a href="mailto:info@functioninstitute.com" style="color: #3498db; text-decoration: none; font-weight: bold;">info@functioninstitute.com</a>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          - Function Institute Team
        </p>
      </div>
    </body>
    </html>
  `;

  const textBody = `Test Completed Successfully!

Dear ${data.studentName},

Congratulations on completing your placement test!

YOUR ASSESSED LEVEL: ${data.assessedLevel}
Score: ${data.earnedPoints}/${data.totalPoints} (${data.scorePercent.toFixed(1)}%)

PROCESSING YOUR RESULTS
Thank you for completing the placement test! Our team is currently reviewing your results and preparing your detailed report.

NEXT STEPS
You will receive a detailed report shortly via email which includes:
- Detailed performance report
- Class schedule and enrollment details
- Payment information
- Access to learning materials

Need help? Contact us at info@functioninstitute.com

- Function Institute Team`;

  return await sendEmail({
    to: data.to,
    subject: `🎉 Test Completed! Your Assessed Level: ${data.assessedLevel}`,
    htmlBody,
    textBody,
  });
};

export const sendBulkEmails = async (
  recipients: Array<{ email: string; name: string }>,
  emailData: { subject: string; htmlBody: string; textBody: string }
) => {
  const results = [];
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject: emailData.subject,
        htmlBody: emailData.htmlBody.replace('{{name}}', recipient.name),
        textBody: emailData.textBody.replace('{{name}}', recipient.name),
      });
      results.push({ email: recipient.email, success: true, messageId: result.messageId });
    } catch (error: any) {
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  return results;
};

export const verifyEmailConfiguration = async () => {
  try {
    if (USE_SNS) {
      // Can't easily verify SNS without sending
      return { success: true, message: 'SNS configured (Topic ARN set)' };
    } else {
      await transporter.verify();
      return { success: true, message: 'SMTP configured correctly' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getEmailHistory = async (filters: {
  userId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = { sentVia: 'EMAIL' };
  if (filters.userId) where.userId = filters.userId;

  const [emails, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: emails,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};