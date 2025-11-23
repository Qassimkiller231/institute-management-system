// src/controllers/sms.controller.ts
import { Response } from 'express';
import * as smsService from '../services/sms.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/sms/send
 * Send SMS to a single recipient
 */
export const sendSMS = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, message, type } = req.body;

    // Validation
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone and message are required',
      });
    }

    const result = await smsService.sendSMS({
      to: phone,
      message,
      userId: req.user?.userId,
      type: type || 'GENERAL',
    });

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
    });
  }
};

/**
 * POST /api/sms/send-otp
 * Send OTP via SMS
 */
export const sendOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, code } = req.body;

    // Validation
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone and code are required',
      });
    }

    const result = await smsService.sendOTP({
      phone,
      code,
      userId: req.user?.userId,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
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

/**
 * POST /api/sms/payment-reminder
 * Send payment reminder via SMS
 */
export const sendPaymentReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, studentName, amount, dueDate, userId } = req.body;

    // Validation
    if (!phone || !studentName || !amount || !dueDate || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Phone, studentName, amount, dueDate, and userId are required',
      });
    }

    const result = await smsService.sendPaymentReminder({
      phone,
      studentName,
      amount,
      dueDate,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment reminder sent successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Send payment reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment reminder',
    });
  }
};

/**
 * POST /api/sms/attendance-warning
 * Send attendance warning via SMS
 */
export const sendAttendanceWarning = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, studentName, attendancePercentage, userId } = req.body;

    // Validation
    if (!phone || !studentName || attendancePercentage === undefined || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Phone, studentName, attendancePercentage, and userId are required',
      });
    }

    const result = await smsService.sendAttendanceWarning({
      phone,
      studentName,
      attendancePercentage,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance warning sent successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Send attendance warning error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send attendance warning',
    });
  }
};

/**
 * POST /api/sms/bulk
 * Send bulk SMS to multiple recipients
 */
export const sendBulkSMS = async (req: AuthRequest, res: Response) => {
  try {
    const { recipients, message, type } = req.body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required and must not be empty',
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const result = await smsService.sendBulkSMS({
      recipients,
      message,
      type: type || 'GENERAL',
    });

    res.status(200).json({
      success: true,
      message: `Bulk SMS sent: ${result.sent} successful, ${result.failed} failed`,
      data: result,
    });
  } catch (error: any) {
    console.error('Send bulk SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk SMS',
    });
  }
};

/**
 * GET /api/sms/history
 * Get SMS history for current user
 */
export const getSMSHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const filters = {
      type: req.query.type as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await smsService.getSMSHistory(userId, filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get SMS history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch SMS history',
    });
  }
};

/**
 * GET /api/sms/logs (Admin only)
 * Get all SMS logs with filters
 */
export const getAllSMSLogs = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      type: req.query.type as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await smsService.getAllSMSLogs(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get all SMS logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch SMS logs',
    });
  }
};

/**
 * GET /api/sms/verify-config (Admin only)
 * Verify Twilio configuration
 */
export const verifyConfig = async (req: AuthRequest, res: Response) => {
  try {
    const result = await smsService.verifyTwilioConfig();

    res.status(200).json({
      success: true,
      message: 'Twilio configuration is valid',
      data: result,
    });
  } catch (error: any) {
    console.error('Verify Twilio config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Twilio configuration is invalid',
    });
  }
};