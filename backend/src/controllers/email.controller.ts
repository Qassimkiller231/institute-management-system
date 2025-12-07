// src/controllers/email.controller.ts
import { Response } from 'express';
import * as emailService from '../services/email.service';
import { AuthRequest } from '../types/auth.types';

export const sendTestEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'to, subject, and message required',
      });
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      htmlBody: `<p>${message}</p>`,
      textBody: message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
};

export const sendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { to, name, otpCode, expiryMinutes } = req.body;

    if (!to || !name || !otpCode || !expiryMinutes) {
      return res.status(400).json({
        success: false,
        message: 'to, name, otpCode, expiryMinutes required',
      });
    }

    const result = await emailService.sendOtpEmail({
      to,
      name,
      otpCode,
      expiryMinutes,
    });

    res.status(200).json({
      success: true,
      message: 'OTP email sent',
      data: result,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

export const sendReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.to || !data.studentName || !data.receiptNumber || !data.amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const result = await emailService.sendPaymentReceiptEmail({
      ...data,
      paymentDate: new Date(data.paymentDate),
    });

    res.status(200).json({
      success: true,
      message: 'Receipt email sent',
      data: result,
    });
  } catch (error: any) {
    console.error('Send receipt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send receipt',
    });
  }
};

export const sendPaymentReminder = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.to || !data.studentName || !data.amount || !data.reminderType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const result = await emailService.sendPaymentReminderEmail({
      ...data,
      dueDate: new Date(data.dueDate),
    });

    res.status(200).json({
      success: true,
      message: 'Payment reminder sent',
      data: result,
    });
  } catch (error: any) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reminder',
    });
  }
};

export const sendAttendanceWarning = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.to || !data.studentName || !data.attendancePercentage) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const result = await emailService.sendAttendanceWarningEmail(data);

    res.status(200).json({
      success: true,
      message: 'Attendance warning sent',
      data: result,
    });
  } catch (error: any) {
    console.error('Send warning error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send warning',
    });
  }
};

export const sendAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.to || !data.recipientName || !data.title || !data.content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const result = await emailService.sendAnnouncementEmail(data);

    res.status(200).json({
      success: true,
      message: 'Announcement sent',
      data: result,
    });
  } catch (error: any) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send announcement',
    });
  }
};

export const sendBulk = async (req: AuthRequest, res: Response) => {
  try {
    const { recipients, emailData } = req.body;

    if (!recipients || !emailData) {
      return res.status(400).json({
        success: false,
        message: 'recipients and emailData required',
      });
    }

    const results = await emailService.sendBulkEmails(recipients, emailData);

    const successCount = results.filter((r) => r.success).length;

    res.status(200).json({
      success: true,
      message: `Sent ${successCount}/${results.length} emails`,
      data: results,
    });
  } catch (error: any) {
    console.error('Bulk send error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk emails',
    });
  }
};

export const verifySes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await emailService.verifyEmailConfiguration();

    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error('Verify SES error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'SES verification failed',
    });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await emailService.getEmailHistory(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get history',
    });
  }
};