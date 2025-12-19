import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import attendanceService from '../services/attendance.service';
import { processBulkAttendanceUpload } from '../services/attendanceUpload.service';

export class AttendanceController {
  // Record single attendance
  async recordAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { studentId, classSessionId, status, notes, teacherId } = req.body;

      if (!studentId || !classSessionId || !status) {
        res.status(400).json({
          success: false,
          message: 'studentId, classSessionId, and status are required'
        });
        return;
      }

      if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED'
        });
        return;
      }

      const attendance = await attendanceService.recordAttendance({
        studentId,
        classSessionId,
        status,
        notes,
        userId: req.user!.userId,
        userRole: req.user!.role,
        teacherId
      });

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record attendance'
      });
    }
  }

  // Bulk record attendance for a class session
  async recordBulkAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { classSessionId, records, teacherId } = req.body;

      if (!classSessionId || !records || !Array.isArray(records)) {
        res.status(400).json({
          success: false,
          message: 'classSessionId and records array are required'
        });
        return;
      }

      if (records.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Records array cannot be empty'
        });
        return;
      }

      // Validate each record
      for (const record of records) {
        if (!record.studentId || !record.status) {
          res.status(400).json({
            success: false,
            message: 'Each record must have studentId and status'
          });
          return;
        }
        if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(record.status)) {
          res.status(400).json({
            success: false,
            message: 'Invalid status in records. Must be PRESENT, ABSENT, LATE, or EXCUSED'
          });
          return;
        }
      }

      const result = await attendanceService.recordBulkAttendance({
        classSessionId,
        records,
        userId: req.user!.userId,
        userRole: req.user!.role,
        teacherId
      });

      res.status(201).json({
        success: true,
        message: `Attendance recorded for ${result.count} students`,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to record bulk attendance'
      });
    }
  }

  // Get attendance for a student
  async getStudentAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const { groupId, termId, startDate, endDate } = req.query;

      const filters: any = {};
      if (groupId) filters.groupId = groupId as string;
      if (termId) filters.termId = termId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const attendance = await attendanceService.getStudentAttendance(studentId, filters);

      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get student attendance'
      });
    }
  }

  // Get attendance for a class session
  async getSessionAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const attendance = await attendanceService.getSessionAttendance(sessionId);

      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get session attendance'
      });
    }
  }

  // Update attendance record
  async updateAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (status && !['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED'
        });
        return;
      }

      const attendance = await attendanceService.updateAttendance(id, {
        status,
        notes
      });

      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update attendance'
      });
    }
  }

  // Delete attendance record
  async deleteAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await attendanceService.deleteAttendance(id);

      res.status(200).json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete attendance'
      });
    }
  }

  // Get attendance statistics for a student
  async getAttendanceStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const { groupId, termId, startDate, endDate } = req.query;

      const filters: any = {};
      if (groupId) filters.groupId = groupId as string;
      if (termId) filters.termId = termId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await attendanceService.getAttendanceStats(studentId, filters);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get attendance statistics'
      });
    }
  }

  // Get students with low attendance
  async getLowAttendanceStudents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;

      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        res.status(400).json({
          success: false,
          message: 'Threshold must be a number between 0 and 100'
        });
        return;
      }

      const students = await attendanceService.getLowAttendanceStudents(groupId, threshold);

      res.status(200).json({
        success: true,
        count: students.length,
        threshold,
        data: students
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get low attendance students'
      });
    }
  }
  // Upload bulk attendance via CSV
  async uploadBulkAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const result = await processBulkAttendanceUpload(
        req.file.buffer,
        req.user!.userId,
        req.user!.role
      );

      res.status(result.failed > 0 ? 207 : 201).json({
        success: true,
        message: `Processed: ${result.total}, Success: ${result.success}, Failed: ${result.failed}`,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload bulk attendance'
      });
    }
  }
}

export default new AttendanceController();
