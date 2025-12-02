// backend/src/controllers/report.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as reportService from '../services/report.service';

// ============================================
// PLACEMENT TEST REPORTS (Individual Students)
// ============================================

/**
 * GET /api/reports/placement-test/:studentId
 * Generate and download placement test report PDF
 */
export const downloadPlacementTestReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }

    // Generate PDF stream
    const pdfStream = await reportService.generatePlacementTestReport(studentId);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="placement-test-report-${studentId}.pdf"`
    );

    // Pipe PDF stream to response
    pdfStream.pipe(res);

  } catch (error: any) {
    console.error('downloadPlacementTestReport error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};

/**
 * GET /api/reports/placement-test/:studentId/preview
 * Get report data without generating PDF (for preview)
 */
export const getPlacementTestReportData = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }

    const reportData = await reportService.getReportData(studentId);

    return res.status(200).json({
      success: true,
      data: reportData
    });

  } catch (error: any) {
    console.error('getPlacementTestReportData error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch report data'
    });
  }
};

/**
 * POST /api/reports/placement-test/:studentId/email
 * Send placement test report via email
 */
export const emailPlacementTestReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { studentId } = req.params;
    const { recipientEmail } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }

    // TODO: Implement email sending with PDF attachment
    // This would use your email service (AWS SES, SendGrid, etc.)
    // For now, return success message

    return res.status(200).json({
      success: true,
      message: 'Report email functionality coming soon',
      data: {
        studentId,
        recipientEmail: recipientEmail || 'student email'
      }
    });

  } catch (error: any) {
    console.error('emailPlacementTestReport error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to email report'
    });
  }
};

// ============================================
// GROUP REPORTS (Teacher Portal)
// ============================================

/**
 * GET /api/reports/group/:groupId/attendance
 * Generate and download group attendance report PDF
 */
export const downloadGroupAttendanceReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required'
      });
    }

    const pdfBuffer = await reportService.generateAttendanceReportPDF(groupId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="attendance-report-${groupId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('downloadGroupAttendanceReport error:', error);
    
    if (error.message === 'Group not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate attendance report'
    });
  }
};

/**
 * GET /api/reports/group/:groupId/progress
 * Generate and download group progress report PDF
 */
export const downloadGroupProgressReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required'
      });
    }

    const pdfBuffer = await reportService.generateProgressReportPDF(groupId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="progress-report-${groupId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('downloadGroupProgressReport error:', error);
    
    if (error.message === 'Group not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate progress report'
    });
  }
};

/**
 * GET /api/reports/group/:groupId/performance
 * Generate and download group performance report PDF
 */
export const downloadGroupPerformanceReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required'
      });
    }

    const pdfBuffer = await reportService.generatePerformanceReportPDF(groupId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="performance-report-${groupId}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('downloadGroupPerformanceReport error:', error);
    
    if (error.message === 'Group not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate performance report'
    });
  }
};