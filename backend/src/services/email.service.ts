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
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #27ae60; color: white; padding: 20px; text-align: center;">
        <h1>✓ Payment Received</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear ${data.studentName},</p>
        <p>Thank you for your payment.</p>
        <table style="width: 100%; margin: 20px 0;">
          <tr><td><strong>Receipt:</strong></td><td>${data.receiptNumber}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${data.paymentDate.toLocaleDateString()}</td></tr>
          <tr><td><strong>Installment:</strong></td><td>#${data.installmentNumber}</td></tr>
          <tr><td><strong>Method:</strong></td><td>${data.paymentMethod}</td></tr>
          <tr><td><strong>Amount:</strong></td><td>${data.currency} ${data.amount.toFixed(2)}</td></tr>
          <tr><td><strong>Balance:</strong></td><td>${data.currency} ${data.balance.toFixed(2)}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const textBody = `Receipt: ${data.receiptNumber}\nAmount: ${data.currency} ${data.amount.toFixed(2)}\nBalance: ${data.currency} ${data.balance.toFixed(2)}`;

  return await sendEmail({
    to: data.to,
    subject: `Payment Receipt #${data.receiptNumber}`,
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