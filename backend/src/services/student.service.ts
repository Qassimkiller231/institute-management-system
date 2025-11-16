// src/services/student.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new student
 * Creates both User and Student records
 */
export const createStudent = async (data: {
  // User data
  email?: string;
  phone?: string;
  
  // Student personal data
  cpr: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  dateOfBirth: string;
  gender: string;
  
  // School information
  schoolType?: string;
  schoolYear?: string;
  
  // Contact preferences
  preferredTiming?: string;
  preferredCenter?: string;
  needsTransport?: boolean;
  
  // Address
  area?: string;
  houseNo?: string;
  road?: string;
  block?: string;
  
  // Additional info
  healthIssues?: string;
  howHeardAbout?: string;
  referralPerson?: string;
  notes?: string;
}) => {
  // Check if CPR already exists
  const existingStudent = await prisma.student.findUnique({
    where: { cpr: data.cpr }
  });

  if (existingStudent) {
    throw new Error('Student with this CPR already exists');
  }

  // Check if email is already used by non-PARENT/STUDENT
  if (data.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingEmail && existingEmail.role !== 'PARENT' && existingEmail.role !== 'STUDENT') {
      throw new Error('Email already in use by another user');
    }
  }
  

  // Create User and Student in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create User
    const user = await tx.user.create({
  data: {
    email: data.email || `student-${data.cpr}@placeholder.local`,
    phone: data.phone,
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
  
  // Search by name, CPR, or email
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
export const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      },
      phones: {
        where: { isActive: true },
        select: {
          id: true,
          phoneNumber: true,
          countryCode: true,
          isPrimary: true,
          isVerified: true
        }
      },
      parentStudentLinks: {
        include: {
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          group: {
            include: {
              level: true,
              term: true,
              venue: true
            }
          }
        },
        orderBy: { enrollmentDate: 'desc' }
      },
      _count: {
        select: {
          enrollments: true,
          testSessions: true,
          attendance: true
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
  gender?: string;
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
}) => {
  const existing = await prisma.student.findUnique({ 
    where: { id },
    include: { user: true }
  });
  
  if (!existing) {
    throw new Error('Student not found');
  }

  // Check email uniqueness if changing email
  if (updates.email && updates.email !== existing.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: updates.email }
    });

    if (existingEmail && existingEmail.id !== existing.userId) {
      // Check if it's a PARENT or STUDENT (allowed to share)
      if (existingEmail.role !== 'PARENT' && existingEmail.role !== 'STUDENT') {
        throw new Error('Email already in use by another user');
      }
    }
  }

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update User if email changed
    if (updates.email && updates.email !== existing.user.email) {
      await tx.user.update({
        where: { id: existing.userId },
        data: { email: updates.email }
      });
    }

    // Update Student
    const data: any = {};
    if (updates.firstName !== undefined) data.firstName = updates.firstName;
    if (updates.secondName !== undefined) data.secondName = updates.secondName;
    if (updates.thirdName !== undefined) data.thirdName = updates.thirdName;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.gender !== undefined) data.gender = updates.gender;
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
 * Add phone number to student
 */
export const addPhone = async (studentId: string, data: {
  phoneNumber: string;
  countryCode?: string;
  isPrimary?: boolean;
}) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error('Student not found');
  }

  // Check if phone already exists
  const existingPhone = await prisma.phone.findUnique({
    where: { phoneNumber: data.phoneNumber }
  });

  if (existingPhone) {
    throw new Error('Phone number already exists');
  }

  // If this is primary, unset other primary phones for this student
  if (data.isPrimary) {
    await prisma.phone.updateMany({
      where: { 
        studentId: studentId,
        isPrimary: true
      },
      data: { isPrimary: false }
    });
  }

  const phone = await prisma.phone.create({
    data: {
      phoneNumber: data.phoneNumber,
      countryCode: data.countryCode || '+973',
      isPrimary: data.isPrimary || false,
      studentId: studentId,
      isActive: true
    }
  });

  return phone;
};

/**
 * Link parent to student
 */
export const linkParent = async (studentId: string, data: {
  parentId: string;
  relationship?: string;
}) => {
  // Check if student exists
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error('Student not found');
  }

  // Check if parent exists
  const parent = await prisma.parent.findUnique({ where: { id: data.parentId } });
  if (!parent) {
    throw new Error('Parent not found');
  }

  // Check if link already exists
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
