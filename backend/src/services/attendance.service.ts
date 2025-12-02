import { PrismaClient, Attendance } from '@prisma/client';

const prisma = new PrismaClient();

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface RecordAttendanceInput {
  studentId: string;
  classSessionId: string;
  status: AttendanceStatus;
  notes?: string;
  userId: string;
  userRole: string;
  teacherId?: string; // Optional: provided by admin
}

interface BulkAttendanceInput {
  classSessionId: string;
  records: {
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
  userId: string;
  userRole: string;
  teacherId?: string; // Optional: provided by admin
}

interface AttendanceStats {
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export class AttendanceService {
  // Record single attendance
  async recordAttendance(data: RecordAttendanceInput): Promise<Attendance> {
    // Determine the teacher ID based on role
    let recordedBy: string;
    
    if (data.userRole === 'TEACHER') {
      // Get teacher ID from userId
      const teacher = await prisma.teacher.findUnique({
        where: { userId: data.userId }
      });
      
      if (!teacher) {
        throw new Error('Teacher record not found for this user');
      }
      recordedBy = teacher.id;
    } else if (data.userRole === 'ADMIN') {
      // Admin must provide teacherId
      if (!data.teacherId) {
        throw new Error('Admin must provide teacherId when recording attendance');
      }
      recordedBy = data.teacherId;
    } else {
      throw new Error('Only teachers and admins can record attendance');
    }
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId }
    });
    if (!student) {
      throw new Error('Student not found');
    }

    // Check if class session exists
    const classSession = await prisma.classSession.findUnique({
      where: { id: data.classSessionId }
    });
    if (!classSession) {
      throw new Error('Class session not found');
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: recordedBy }
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Check if attendance already exists
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        classSessionId: data.classSessionId
      }
    });

    if (existing) {
      throw new Error('Attendance already recorded for this student in this session');
    }

    // Get enrollment ID for this student in the group
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        group: {
          classSessions: {
            some: {
              id: data.classSessionId
            }
          }
        },
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      throw new Error('Student is not enrolled in this group');
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        classSessionId: data.classSessionId,
        enrollmentId: enrollment.id,
        status: data.status,
        notes: data.notes,
        markedBy: recordedBy,
        markedAt: new Date()
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        classSession: {
          include: {
            group: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    return attendance;
  }

  // Bulk record attendance for a class session
  async recordBulkAttendance(data: BulkAttendanceInput): Promise<{ count: number; records: Attendance[] }> {
    // Determine the teacher ID based on role
    let recordedBy: string;
    
    if (data.userRole === 'TEACHER') {
      // Get teacher ID from userId
      const teacher = await prisma.teacher.findUnique({
        where: { userId: data.userId }
      });
      
      if (!teacher) {
        throw new Error('Teacher record not found for this user');
      }
      recordedBy = teacher.id;
    } else if (data.userRole === 'ADMIN') {
      // Admin must provide teacherId
      if (!data.teacherId) {
        throw new Error('Admin must provide teacherId when recording attendance');
      }
      recordedBy = data.teacherId;
    } else {
      throw new Error('Only teachers and admins can record attendance');
    }
    
    // Verify class session exists
    const classSession = await prisma.classSession.findUnique({
      where: { id: data.classSessionId },
      include: {
        group: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              select: { studentId: true }
            }
          }
        }
      }
    });

    if (!classSession) {
      throw new Error('Class session not found');
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: recordedBy }
    });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Get enrolled student IDs
    const enrolledStudentIds = classSession.group.enrollments.map(e => e.studentId);

    // Validate all students in the records are enrolled in this group
    const invalidStudents = data.records.filter(r => !enrolledStudentIds.includes(r.studentId));
    if (invalidStudents.length > 0) {
      throw new Error(`Some students are not enrolled in this group: ${invalidStudents.map(s => s.studentId).join(', ')}`);
    }

    // Check for duplicate records in the input
    const studentIds = data.records.map(r => r.studentId);
    const duplicates = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate student IDs in request: ${duplicates.join(', ')}`);
    }

    // Check if any attendance already exists (for upsert logic)
    const existingRecords = await prisma.attendance.findMany({
      where: {
        classSessionId: data.classSessionId,
        studentId: { in: studentIds }
      }
    });

    const existingStudentIds = new Set(existingRecords.map(r => r.studentId));
    const recordsToCreate = data.records.filter(r => !existingStudentIds.has(r.studentId));
    const recordsToUpdate = data.records.filter(r => existingStudentIds.has(r.studentId));

    // Get enrollments for all students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: { in: studentIds },
        groupId: classSession.groupId,
        status: 'ACTIVE'
      }
    });

    const enrollmentMap = new Map(enrollments.map(e => [e.studentId, e.id]));

    // Update existing attendance records
    const updatePromises = recordsToUpdate.map(record => {
      const existingRecord = existingRecords.find(r => r.studentId === record.studentId);
      if (!existingRecord) return null;

      return prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          status: record.status,
          notes: record.notes
        }
      });
    }).filter(Boolean);

    // Create new attendance records
    const createPromises = recordsToCreate.map(record => {
      const enrollmentId = enrollmentMap.get(record.studentId);
      if (!enrollmentId) {
        throw new Error(`No active enrollment found for student: ${record.studentId}`);
      }

      return prisma.attendance.create({
        data: {
          studentId: record.studentId,
          classSessionId: data.classSessionId,
          enrollmentId: enrollmentId,
          status: record.status,
          notes: record.notes,
          markedBy: recordedBy,
          markedAt: new Date()
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      })
    });

    // Execute all updates and creates
    const [updatedRecords, createdRecords] = await Promise.all([
      Promise.all(updatePromises),
      Promise.all(createPromises)
    ]);

    const allRecords = [...createdRecords];

    return {
      count: allRecords.length,
      records: allRecords
    };
  }

  // Get attendance for a specific student
  async getStudentAttendance(
    studentId: string,
    filters?: {
      groupId?: string;
      termId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Attendance[]> {
    const where: any = { studentId };

    if (filters?.groupId) {
      where.classSession = {
        groupId: filters.groupId
      };
    }

    if (filters?.termId) {
      where.classSession = {
        ...where.classSession,
        group: {
          termId: filters.termId
        }
      };
    }

    if (filters?.startDate || filters?.endDate) {
      where.classSession = {
        ...where.classSession,
        sessionDate: {}
      };
      if (filters.startDate) {
        where.classSession.sessionDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.classSession.sessionDate.lte = filters.endDate;
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        classSession: {
          include: {
            group: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return attendance;
  }

  // Get attendance for a class session
  async getSessionAttendance(classSessionId: string): Promise<Attendance[]> {
    const classSession = await prisma.classSession.findUnique({
      where: { id: classSessionId }
    });

    if (!classSession) {
      throw new Error('Class session not found');
    }

    const attendance = await prisma.attendance.findMany({
      where: { classSessionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return attendance;
  }

  // Update attendance record
  async updateAttendance(
    id: string,
    data: {
      status?: AttendanceStatus;
      notes?: string;
    }
  ): Promise<Attendance> {
    const existing = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Attendance record not found');
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        updatedAt: new Date()
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        classSession: {
          include: {
            group: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    return updated;
  }

  // Delete attendance record
  async deleteAttendance(id: string): Promise<void> {
    const existing = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Attendance record not found');
    }

    await prisma.attendance.delete({
      where: { id }
    });
  }

  // Calculate attendance statistics for a student
  async getAttendanceStats(
    studentId: string,
    filters?: {
      groupId?: string;
      termId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AttendanceStats> {
    const attendance = await this.getStudentAttendance(studentId, filters);

    const stats: AttendanceStats = {
      totalSessions: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      excused: attendance.filter(a => a.status === 'EXCUSED').length,
      attendanceRate: 0
    };

    // Calculate attendance rate (Present + Late) / Total
    if (stats.totalSessions > 0) {
      stats.attendanceRate = ((stats.present + stats.late) / stats.totalSessions) * 100;
    }

    return stats;
  }

  // Get students with low attendance for a group
  async getLowAttendanceStudents(
    groupId: string,
    threshold: number = 75
  ): Promise<Array<{
    studentId: string;
    studentName: string;
    email: string;
    attendanceRate: number;
    totalSessions: number;
    present: number;
    absent: number;
  }>> {
    // Get all enrollments for the group
    const enrollments = await prisma.enrollment.findMany({
      where: {
        groupId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    const results = [];

    for (const enrollment of enrollments) {
      const stats = await this.getAttendanceStats(enrollment.studentId, { groupId });
      
      if (stats.attendanceRate < threshold) {
        const studentFullName = [
          enrollment.student.firstName,
          enrollment.student.secondName,
          enrollment.student.thirdName
        ].filter(Boolean).join(' ');
        
        results.push({
          studentId: enrollment.studentId,
          studentName: studentFullName,
          email: enrollment.student.user.email,
          attendanceRate: Math.round(stats.attendanceRate * 100) / 100,
          totalSessions: stats.totalSessions,
          present: stats.present,
          absent: stats.absent
        });
      }
    }

    // Sort by attendance rate ascending (worst first)
    return results.sort((a, b) => a.attendanceRate - b.attendanceRate);
  }
}

export default new AttendanceService();