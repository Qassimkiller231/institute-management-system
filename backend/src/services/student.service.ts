// src/services/student.service.ts
import { PrismaClient } from '@prisma/client';
import { normalizePhoneNumber, validatePhoneNumber } from '../utils/phone.utils';

import auditService from './audit.service';

const prisma = new PrismaClient();

/**
 * Create a new student
 */
export const createStudent = async (data: {
  email?: string;
  phone?: string;
  cpr: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  dateOfBirth: string;
  gender: string;
  currentLevel?: string;
  schoolType?: string;
  schoolYear?: string;
  preferredTiming?: string;
  preferredCenter?: string;
  needsTransport?: boolean;
  area?: string;
  houseNo?: string;
  road?: string;
  block?: string;
  healthIssues?: string;
  howHeardAbout?: string;
  referralPerson?: string;
  notes?: string;
  performedBy?: string;
}) => {
  // Check if CPR already exists
  const existingStudent = await prisma.student.findUnique({
    where: { cpr: data.cpr }
  });

  if (existingStudent) {
    throw new Error('Student with this CPR already exists');
  }

  // Check if email is already used
  if (data.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }

  // Normalize phone number if provided
  let normalizedPhone: string | undefined;
  if (data.phone) {
    try {
      normalizedPhone = normalizePhoneNumber(data.phone);
      if (!validatePhoneNumber(data.phone)) {
        throw new Error('Invalid phone number format');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid phone number');
    }
  }

  // Create User and Student in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
      data: {
        email: data.email || `student-${data.cpr}@placeholder.local`,
        phone: normalizedPhone,
        role: 'STUDENT',
        isActive: true
      }
    });

    // Create Student
    const student = await tx.student.create({
      data: {
        userId: user.id,
        cpr: data.cpr,
        firstName: data.firstName,
        secondName: data.secondName,
        thirdName: data.thirdName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        currentLevel: data.currentLevel,
        email: data.email,
        schoolType: data.schoolType,
        schoolYear: data.schoolYear,
        preferredTiming: data.preferredTiming,
        preferredCenter: data.preferredCenter,
        needsTransport: data.needsTransport || false,
        area: data.area,
        houseNo: data.houseNo,
        road: data.road,
        block: data.block,
        healthIssues: data.healthIssues,
        howHeardAbout: data.howHeardAbout,
        referralPerson: data.referralPerson,
        notes: data.notes,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    return student;
  });

  // ✅ LOG AUDIT EVENT
  if (data.performedBy) {
    await auditService.createLog({
      userId: data.performedBy,
      action: 'STUDENT_CREATED',
      tableName: 'Student',
      recordId: result.id,
      newValues: {
        firstName: result.firstName,
        lastName: result.secondName, // Assuming secondName acts as last name for simplicity or just use full name construction
        cpr: result.cpr
      }
    });
  }

  return result;
};

/**
 * Get all students with filters and pagination
 */
export const getAllStudents = async (filters: {
  isActive?: boolean;
  gender?: string;
  schoolType?: string;
  schoolYear?: string;
  preferredCenter?: string;
  search?: string;
  page?: number;
  limit?: number;
  needsSpeakingTest?: boolean;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.gender) where.gender = filters.gender;
  if (filters.schoolType) where.schoolType = filters.schoolType;
  if (filters.schoolYear) where.schoolYear = filters.schoolYear;
  if (filters.preferredCenter) where.preferredCenter = filters.preferredCenter;

  // Filter for students who need a speaking test (MCQ completed but not yet booked)
  if (filters.needsSpeakingTest) {
    where.testSessions = {
      some: {
        status: 'MCQ_COMPLETED'
      }
    };
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { secondName: { contains: filters.search, mode: 'insensitive' } },
      { thirdName: { contains: filters.search, mode: 'insensitive' } },
      { cpr: { contains: filters.search } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
            lastLogin: true
          }
        },
        phones: {
          where: { isActive: true },
          select: {
            id: true,
            phoneNumber: true,
            isPrimary: true
          }
        },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            group: {
              include: {
                level: {
                  select: { id: true, name: true }
                },
                venue: {
                  select: { id: true, name: true }
                }
              }
            }
          },
          take: 1,
          orderBy: { enrollmentDate: 'desc' }
        },
        _count: {
          select: {
            enrollments: true,
            parentStudentLinks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.student.count({ where })
  ]);

  return {
    data: students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get student by ID with full details
 */
export const getStudentById = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
          role: true
        }
      },
      phones: {
        where: { isActive: true }
      },
      enrollments: {
        where: {
          status: 'ACTIVE'
        },
        include: {
          group: {
            include: {
              level: {
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              },
              term: {
                select: {
                  name: true,
                  isCurrent: true,
                  startDate: true,
                  endDate: true
                }
              },
              venue: {
                select: {
                  name: true,
                  address: true
                }
              }
            }
          }
        },
        orderBy: {
          enrollmentDate: 'desc'
        }
      },
      testSessions: {
        orderBy: {
          startedAt: 'desc'
        },
        take: 5,
        include: {
          test: {
            select: {
              name: true,
              testType: true
            }
          }
        }
      },
      speakingSlots: {
        orderBy: {
          slotDate: 'desc'
        },
        include: {
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return student;
};

/**
 * Update student information
 */
export const updateStudent = async (id: string, updates: {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  email?: string;
  phone?: string;
  cpr?: string;
  dateOfBirth?: string;
  gender?: string;
  currentLevel?: string;
  schoolType?: string;
  schoolYear?: string;
  preferredTiming?: string;
  preferredCenter?: string;
  needsTransport?: boolean;
  area?: string;
  houseNo?: string;
  road?: string;
  block?: string;
  healthIssues?: string;
  howHeardAbout?: string;
  referralPerson?: string;
  notes?: string;
  isActive?: boolean;
}, performedBy?: string) => {
  const existing = await prisma.student.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Student not found');
  }

  // Check CPR uniqueness if changing
  if (updates.cpr && updates.cpr !== existing.cpr) {
    const existingCpr = await prisma.student.findUnique({
      where: { cpr: updates.cpr }
    });
    if (existingCpr && existingCpr.id !== id) {
      throw new Error('CPR already in use by another student');
    }
  }

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // CASCADE: If activating/deactivating student, do the same to user
    if (updates.isActive !== undefined && updates.isActive !== existing.user.isActive) {
      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: updates.isActive }
      });
    }

    // Update user phone if provided
    const userUpdates: any = {};
    if (updates.phone !== undefined) {
      // Normalize phone number
      if (updates.phone) {
        try {
          userUpdates.phone = normalizePhoneNumber(updates.phone);
          if (!validatePhoneNumber(updates.phone)) {
            throw new Error('Invalid phone number format');
          }
        } catch (error: any) {
          throw new Error(error.message || 'Invalid phone number');
        }
      } else {
        userUpdates.phone = updates.phone; // Allow null/undefined
      }
    }

    // Check email uniqueness if changing email
    if (updates.email && updates.email !== existing.email) {
      const existingEmail = await tx.user.findUnique({
        where: { email: updates.email }
      });

      // If email exists in User table and belongs to different user
      if (existingEmail && existingEmail.id !== existing.userId) {
        // Allow sharing ONLY if it's PARENT or STUDENT
        if (existingEmail.role !== 'PARENT' && existingEmail.role !== 'STUDENT') {
          throw new Error('Email already in use by another user');
        }
        // If sharing with PARENT/STUDENT, DON'T update User table
      } else if (!existingEmail || existingEmail.id === existing.userId) {
        // Email is free OR it's the student's own email - can update User table
        userUpdates.email = updates.email;
      }
    }

    // Update user table if there are changes
    if (Object.keys(userUpdates).length > 0) {
      await tx.user.update({
        where: { id: existing.userId },
        data: userUpdates
      });
    }

    // Update Student data
    const data: any = {};
    if (updates.firstName !== undefined) data.firstName = updates.firstName;
    if (updates.secondName !== undefined) data.secondName = updates.secondName;
    if (updates.thirdName !== undefined) data.thirdName = updates.thirdName;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.cpr !== undefined) data.cpr = updates.cpr;
    if (updates.dateOfBirth !== undefined) data.dateOfBirth = new Date(updates.dateOfBirth);
    if (updates.gender !== undefined) data.gender = updates.gender;
    if (updates.currentLevel !== undefined) data.currentLevel = updates.currentLevel;
    if (updates.schoolType !== undefined) data.schoolType = updates.schoolType;
    if (updates.schoolYear !== undefined) data.schoolYear = updates.schoolYear;
    if (updates.preferredTiming !== undefined) data.preferredTiming = updates.preferredTiming;
    if (updates.preferredCenter !== undefined) data.preferredCenter = updates.preferredCenter;
    if (updates.needsTransport !== undefined) data.needsTransport = updates.needsTransport;
    if (updates.area !== undefined) data.area = updates.area;
    if (updates.houseNo !== undefined) data.houseNo = updates.houseNo;
    if (updates.road !== undefined) data.road = updates.road;
    if (updates.block !== undefined) data.block = updates.block;
    if (updates.healthIssues !== undefined) data.healthIssues = updates.healthIssues;
    if (updates.howHeardAbout !== undefined) data.howHeardAbout = updates.howHeardAbout;
    if (updates.referralPerson !== undefined) data.referralPerson = updates.referralPerson;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;

    const student = await tx.student.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true
          }
        }
      }
    });

    return student;
  });

  // ✅ LOG AUDIT EVENT
  if (performedBy) {
    const changes: any = {};
    if (updates.firstName && updates.firstName !== existing.firstName) changes.firstName = updates.firstName;
    if (updates.cpr && updates.cpr !== existing.cpr) changes.cpr = updates.cpr;
    if (updates.email && updates.email !== existing.email) changes.email = updates.email;
    if (updates.isActive !== undefined && updates.isActive !== existing.isActive) changes.isActive = updates.isActive;

    // Only log if meaningful changes occurred
    if (Object.keys(changes).length > 0) {
      await auditService.createLog({
        userId: performedBy,
        action: 'STUDENT_UPDATED',
        tableName: 'Student',
        recordId: id,
        oldValues: {
          firstName: existing.firstName,
          cpr: existing.cpr,
          email: existing.email,
          isActive: existing.isActive
        },
        newValues: changes
      });
    }
  }

  return result;
};

/**
 * Deactivate student (soft delete)
 */
export const deleteStudent = async (id: string) => {
  const existing = await prisma.student.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Student not found');
  }

  // Deactivate both User and Student
  await prisma.$transaction([
    prisma.user.update({
      where: { id: existing.userId },
      data: { isActive: false }
    }),
    prisma.student.update({
      where: { id },
      data: { isActive: false }
    })
  ]);

  return { message: 'Student deactivated successfully' };
};

/**
 * Link parent to student
 */
export const linkParent = async (studentId: string, data: {
  parentId: string;
  relationship?: string;
}) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error('Student not found');
  }

  const parent = await prisma.parent.findUnique({ where: { id: data.parentId } });
  if (!parent) {
    throw new Error('Parent not found');
  }

  const existingLink = await prisma.parentStudentLink.findFirst({
    where: {
      parentId: data.parentId,
      studentId: studentId
    }
  });

  if (existingLink) {
    throw new Error('Parent is already linked to this student');
  }

  const link = await prisma.parentStudentLink.create({
    data: {
      parentId: data.parentId,
      studentId: studentId,
      relationship: data.relationship
    },
    include: {
      parent: {
        include: {
          user: {
            select: {
              email: true,
              phone: true
            }
          }
        }
      },
      student: { // Added student include to access enrollments
        include: {
          enrollments: {
            include: {
              group: {
                include: {
                  level: true,
                  teacher: true,
                  term: true
                }
              }
            }
          }
        }
      }
    }
  });

  return link;
};

/**
 * Search students by name, CPR, or email
 */
export const searchStudents = async (query: string, limit: number = 20) => {
  const students = await prisma.student.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { secondName: { contains: query, mode: 'insensitive' } },
        { thirdName: { contains: query, mode: 'insensitive' } },
        { cpr: { contains: query } },
        { email: { contains: query, mode: 'insensitive' } }
      ],
      isActive: true
    },
    select: {
      id: true,
      firstName: true,
      secondName: true,
      thirdName: true,
      cpr: true,
      email: true,
      gender: true,
      user: {
        select: {
          phone: true
        }
      }
    },
    take: limit,
    orderBy: { firstName: 'asc' }
  });

  return students;
};
/**
 * Get students based on ENROLLMENT filters (for dashboard)
 * - programId / termId / groupId / venueId
 * - status: ACTIVE, WITHDREW, LATE_ENROLLMENT, FREE_SEAT, etc.
 */
export const getStudentsByEnrollmentFilters = async (filters: {
  programId?: string;
  termId?: string;
  groupId?: string;
  levelId?: string;
  venueId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Enrollment-level filters
  if (filters.status) where.status = filters.status;
  if (filters.groupId) where.groupId = filters.groupId;

  // Nested group filters
  if (filters.programId || filters.termId || filters.levelId || filters.venueId) {
    where.group = {};
    if (filters.termId) where.group.termId = filters.termId;
    if (filters.levelId) where.group.levelId = filters.levelId;
    if (filters.venueId) where.group.venueId = filters.venueId;
    if (filters.programId) {
      where.group.term = { programId: filters.programId };
    }
  }

  // Search on student fields
  if (filters.search) {
    where.student = {
      OR: [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { secondName: { contains: filters.search, mode: 'insensitive' } },
        { thirdName: { contains: filters.search, mode: 'insensitive' } },
        { cpr: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    };
  }

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                isActive: true,
                lastLogin: true
              }
            }
          }
        },
        group: {
          include: {
            level: true,
            term: { include: { program: true } },
            venue: true
          }
        }
      },
      orderBy: { enrollmentDate: 'desc' }
    }),
    prisma.enrollment.count({ where })
  ]);

  // Transform enrollments to students with enrollment info
  const studentsMap = new Map();

  enrollments.forEach(enrollment => {
    const studentId = enrollment.student.id;

    if (!studentsMap.has(studentId)) {
      studentsMap.set(studentId, {
        ...enrollment.student,
        enrollments: [{
          group: enrollment.group,
          status: enrollment.status
        }]
      });
    }
  });

  const students = Array.from(studentsMap.values());

  return {
    data: students,
    pagination: {
      total: students.length,
      page,
      limit,
      totalPages: Math.ceil(students.length / limit)
    }
  };
};
/**
 * Update student profile picture
 */
export const updateProfilePicture = async (id: string, filePath: string) => {
  const student = await prisma.student.findUnique({ where: { id } });

  if (!student) {
    throw new Error('Student not found');
  }

  // Delete old profile picture file if exists
  if (student.profilePicture) {
    const fs = require('fs');
    const path = require('path');
    const oldFilePath = path.join(__dirname, '../..', student.profilePicture);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  // Update student with new profile picture path
  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { profilePicture: filePath }
  });

  return updatedStudent;
};

/**
 * Delete student profile picture
 */
export const deleteProfilePicture = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id } });

  if (!student) {
    throw new Error('Student not found');
  }

  // Delete profile picture file if exists
  if (student.profilePicture) {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../..', student.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Clear profile picture field
  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { profilePicture: null }
  });

  return updatedStudent;
};
