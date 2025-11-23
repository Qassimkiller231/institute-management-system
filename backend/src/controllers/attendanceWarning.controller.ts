import { Request, Response } from 'express';
import * as attendanceWarningService from '../services/notifications/attendanceWarning.service';
import { AuthRequest } from '../types/auth.types';

export const checkAndSendWarnings = async (req: AuthRequest, res: Response) => {
  try {
    await attendanceWarningService.checkAndSendWarnings();
    res.status(200).json({
      success: true,
      message: 'Attendance warnings checked and sent successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send attendance warnings'
    });
  }
};

export const sendManualWarning = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }
    
    await attendanceWarningService.sendManualWarning(studentId);
    
    res.status(200).json({
      success: true,
      message: 'Manual attendance warning sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send manual warning'
    });
  }
};

export const getAtRiskStudents = async (req: AuthRequest, res: Response) => {
  try {
    const atRiskStudents = await attendanceWarningService.getStudentsAtRisk();
    
    res.status(200).json({
      success: true,
      data: atRiskStudents
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch at-risk students'
    });
  }
};