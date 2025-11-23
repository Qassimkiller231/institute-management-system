import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as paymentReminderService from '../services/notifications/paymentReminder.service';
import * as attendanceWarningService from '../services/notifications/attendanceWarning.service';

/**
 * POST /api/notifications/payment-reminder/:installmentId
 * Manually trigger payment reminder (Admin only)
 */
export const sendPaymentReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId } = req.params;
    
    if (!installmentId) {
      return res.status(400).json({
        success: false,
        message: 'Installment ID is required'
      });
    }
    
    await paymentReminderService.sendManualReminder(installmentId);
    
    res.status(200).json({
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error: any) {
    console.error('Send payment reminder error:', error);
    
    if (error.message === 'Installment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment reminder'
    });
  }
};

/**
 * POST /api/notifications/attendance-warning/:studentId
 * Manually trigger attendance warning (Admin only)
 */
export const sendAttendanceWarning = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }
    
    await attendanceWarningService.sendManualWarning(studentId);
    
    res.status(200).json({
      success: true,
      message: 'Attendance warning sent successfully'
    });
  } catch (error: any) {
    console.error('Send attendance warning error:', error);
    
    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send attendance warning'
    });
  }
};

/**
 * GET /api/notifications/at-risk-students
 * Get list of students with low attendance (Admin only)
 */
export const getAtRiskStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await attendanceWarningService.getStudentsAtRisk();
    
    res.status(200).json({
      success: true,
      data: students,
      total: students.length
    });
  } catch (error: any) {
    console.error('Get at-risk students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch at-risk students'
    });
  }
};

/**
 * POST /api/notifications/test-scheduler
 * Test notification scheduler (Admin only)
 */
export const testScheduler = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Testing payment reminders...');
    await paymentReminderService.checkAndSendReminders();
    
    console.log('Testing attendance warnings...');
    await attendanceWarningService.checkAndSendWarnings();
    
    res.status(200).json({
      success: true,
      message: 'Scheduler test completed - check console for sent notifications'
    });
  } catch (error: any) {
    console.error('Test scheduler error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test scheduler'
    });
  }
};