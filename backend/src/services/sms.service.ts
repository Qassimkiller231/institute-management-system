// src/services/sms.service.ts
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import { normalizePhoneNumber } from '../utils/phone.utils';

const prisma = new PrismaClient();
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';

let twilioClient: any = null;

if (accountSid && authToken && accountSid.startsWith('AC')) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.log('⚠️ Twilio not configured - SMS will be logged only');
}
// Initialize Twilio client


const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

/**
 * Send SMS to a single recipient
 */
export const sendSMS = async (data: {
  to: string;
  message: string;
  userId?: string;
  type?: string;
}) => {
  try {
    // SAFE MODE: Redirect all SMS
    const originalTo = data.to;
    let phoneToUse = '35140480';

    // Prepend original recipient to message
    data.message = `[To: ${originalTo}] ${data.message}`;

    console.log(`⚠️ Redirecting SMS from ${originalTo} to ${phoneToUse}`);

    // Twilio REQUIRES international format: +[country code][number]
    // If phone doesn't start with +, add +973 (Bahrain)
    const formattedPhone = phoneToUse.startsWith('+') ? phoneToUse : `+973${phoneToUse}`;

    console.log(`📱 Original: ${data.to}`);
    console.log(`📱 Final (for Twilio): ${formattedPhone}`);
    console.log(`📱 Twilio client: ${!!twilioClient ? 'YES' : 'NO'}`);

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: data.message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ Twilio response: SID=${result.sid}, Status=${result.status}`);

    // Log SMS in notifications table
    if (data.userId) {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type || 'GENERAL',
          title: 'SMS Notification',
          message: data.message,
          sentVia: 'SMS',
          sentAt: new Date(),
        },
      });
    }

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: formattedPhone,
      message: data.message,
    };
  } catch (error: any) {
    console.error('❌ Twilio SMS error:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error status:', error.status);
    throw new Error(error.message || 'Failed to send SMS');
  }
};

/**
 * Send OTP via SMS
 */
export const sendOTP = async (data: {
  phone: string;
  code: string;
  userId?: string;
}) => {
  const message = `Your OTP code is: ${data.code}. Valid for 5 minutes. Do not share this code.`;
  console.log(data.phone);
  return await sendSMS({
    to: data.phone,
    message,
    userId: data.userId,
    type: 'OTP',
  });
};

/**
 * Send payment reminder via SMS
 */
export const sendPaymentReminder = async (data: {
  phone: string;
  studentName: string;
  amount: number;
  dueDate: string;
  userId: string;
}) => {
  const message = `Dear ${data.studentName}, your payment of BHD ${data.amount} is due on ${data.dueDate}. Please pay on time. - The Function Institute`;

  return await sendSMS({
    to: data.phone,
    message,
    userId: data.userId,
    type: 'PAYMENT_REMINDER',
  });
};

/**
 * Send attendance warning via SMS
 */
export const sendAttendanceWarning = async (data: {
  phone: string;
  studentName: string;
  attendancePercentage: number;
  userId: string;
}) => {
  const message = `Dear ${data.studentName}, your attendance is ${data.attendancePercentage}%. This is below the required 75%. Please attend classes regularly. - The Function Institute`;

  return await sendSMS({
    to: data.phone,
    message,
    userId: data.userId,
    type: 'ATTENDANCE_WARNING',
  });
};

/**
 * Send bulk SMS to multiple recipients
 */
export const sendBulkSMS = async (data: {
  recipients: Array<{ phone: string; userId?: string }>;
  message: string;
  type?: string;
}) => {
  const results = [];
  const errors = [];

  for (const recipient of data.recipients) {
    try {
      const result = await sendSMS({
        to: recipient.phone,
        message: data.message,
        userId: recipient.userId,
        type: data.type,
      });
      results.push(result);
    } catch (error: any) {
      errors.push({
        phone: recipient.phone,
        error: error.message,
      });
    }
  }

  return {
    success: true,
    sent: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

/**
 * Get SMS history for a user
 */
export const getSMSHistory = async (userId: string, filters?: {
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {
    userId,
    sentVia: 'SMS',
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all SMS logs (Admin only)
 */
export const getAllSMSLogs = async (filters?: {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {
    sentVia: 'SMS',
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.startDate || filters?.endDate) {
    where.sentAt = {};
    if (filters.startDate) where.sentAt.gte = filters.startDate;
    if (filters.endDate) where.sentAt.lte = filters.endDate;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Verify Twilio configuration
 */
export const verifyTwilioConfig = async () => {
  try {
    // Test Twilio credentials by fetching account info
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();

    return {
      success: true,
      accountSid: account.sid,
      accountStatus: account.status,
      phoneNumber: TWILIO_PHONE_NUMBER,
    };
  } catch (error: any) {
    console.error('Twilio verification error:', error);
    throw new Error('Twilio configuration is invalid');
  }
};