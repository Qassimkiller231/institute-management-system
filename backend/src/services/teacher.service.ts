// src/services/teacher.service.ts
import { PrismaClient } from '@prisma/client';
import { normalizePhoneNumber, validatePhoneNumber } from '../utils/phone.utils';

const prisma = new PrismaClient();

/**
 * Create a new teacher
 * Creates both User and Teacher records
 */
export const createTeacher = async (data: {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  availableForSpeakingTests?: boolean;
}) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Check if phone exists (if provided)
  if (data.phone) {
    // Normalize phone number
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(data.phone);
      if (!validatePhoneNumber(data.phone)) {
        throw new Error('Invalid phone number format');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid phone number');
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (existingPhone) {
      throw new Error('Phone number already in use');
    }
  }

  // Create User and Teacher in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Normalize phone if provided
    let normalizedPhone: string | undefined;
    if (data.phone) {
      normalizedPhone = normalizePhoneNumber(data.phone);
      // Already validated above
    }

    // Create User
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: normalizedPhone,
        role: 'TEACHER',
        isActive: true
      }
    });

    // Create Teacher
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        specialization: data.specialization,
        availableForSpeakingTests: data.availableForSpeakingTests ?? true,
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

    return teacher;
  });

  return result;
};

/**
 * Get all teachers with filters and pagination
 */
export const getAllTeachers = async (filters: {
  isActive?: boolean;
  availableForSpeakingTests?: boolean;
  specialization?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.availableForSpeakingTests !== undefined) {
    where.availableForSpeakingTests = filters.availableForSpeakingTests;
  }
  if (filters.specialization) {
    where.specialization = { contains: filters.specialization, mode: 'insensitive' };
  }

  // Search by name or email
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } }
    ];
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
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
        groups: {
          where: { isActive: true },
          include: {
            level: {
              select: { id: true, name: true }
            },
            venue: {
              select: { id: true, name: true }
            }
          },
          take: 5
        },
        _count: {
          select: {
            groups: true,
            speakingSlots: true,
            materials: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.teacher.count({ where })
  ]);

  return {
    data: teachers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get teacher by ID with full details
 */
export const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
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
      groups: {
        where: { isActive: true },
        include: {
          term: {
            select: {
              id: true,
              name: true,
              isCurrent: true
            }
          },
          level: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          },
          venue: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      teacherScheduleTemplates: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' }
      },
      teacherScheduleOverrides: {
        where: {
          overrideDate: {
            gte: new Date()
          }
        },
        orderBy: { overrideDate: 'asc' },
        take: 10
      },
      _count: {
        select: {
          groups: true,
          speakingSlots: true,
          materials: true,
          attendance: true
        }
      }
    }
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  return teacher;
};

/**
 * Update teacher information
 */
export const updateTeacher = async (id: string, updates: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  availableForSpeakingTests?: boolean;
  isActive?: boolean;
}) => {
  const existing = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Teacher not found');
  }

  // Check email uniqueness if changing email
  if (updates.email && updates.email !== existing.user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: updates.email }
    });

    if (existingEmail && existingEmail.id !== existing.userId) {
      throw new Error('Email already in use');
    }
  }

  // Check phone uniqueness if changing phone
  if (updates.phone && updates.phone !== existing.user.phone) {
    // Normalize phone number
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(updates.phone);
      if (!validatePhoneNumber(updates.phone)) {
        throw new Error('Invalid phone number format');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid phone number');
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (existingPhone && existingPhone.id !== existing.userId) {
      throw new Error('Phone number already in use');
    }

    // Store normalized phone for later update
    updates.phone = normalizedPhone;
  }

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // CASCADE: If activating/deactivating teacher, do the same to user
    if (updates.isActive !== undefined && updates.isActive !== existing.user.isActive) {
      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: updates.isActive }
      });
    }

    // Update User if email or phone changed
    const userUpdates: any = {};
    if (updates.email && updates.email !== existing.user.email) {
      userUpdates.email = updates.email;
    }
    if (updates.phone !== undefined && updates.phone !== existing.user.phone) {
      userUpdates.phone = updates.phone;
    }

    if (Object.keys(userUpdates).length > 0) {
      await tx.user.update({
        where: { id: existing.userId },
        data: userUpdates
      });
    }

    // Update Teacher
    const teacherData: any = {};
    if (updates.firstName !== undefined) teacherData.firstName = updates.firstName;
    if (updates.lastName !== undefined) teacherData.lastName = updates.lastName;
    if (updates.specialization !== undefined) teacherData.specialization = updates.specialization;
    if (updates.availableForSpeakingTests !== undefined) {
      teacherData.availableForSpeakingTests = updates.availableForSpeakingTests;
    }
    if (updates.isActive !== undefined) teacherData.isActive = updates.isActive;

    const teacher = await tx.teacher.update({
      where: { id },
      data: teacherData,
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

    return teacher;
  });

  return result;
};

/**
 * Deactivate teacher (soft delete)
 */
export const deleteTeacher = async (id: string) => {
  const existing = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Teacher not found');
  }

  // Deactivate both User and Teacher
  await prisma.$transaction([
    prisma.user.update({
      where: { id: existing.userId },
      data: { isActive: false }
    }),
    prisma.teacher.update({
      where: { id },
      data: { isActive: false }
    })
  ]);

  return { message: 'Teacher deactivated successfully' };
};

/**
 * Toggle speaking test availability
 */
export const toggleAvailability = async (id: string, available: boolean) => {
  const existing = await prisma.teacher.findUnique({ where: { id } });

  if (!existing) {
    throw new Error('Teacher not found');
  }

  const teacher = await prisma.teacher.update({
    where: { id },
    data: { availableForSpeakingTests: available },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });

  return teacher;
};

/**
 * Search teachers by name or email
 */
export const searchTeachers = async (query: string, limit: number = 20) => {
  const teachers = await prisma.teacher.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { user: { email: { contains: query, mode: 'insensitive' } } }
      ],
      isActive: true
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialization: true,
      availableForSpeakingTests: true,
      user: {
        select: {
          email: true,
          phone: true
        }
      }
    },
    take: limit,
    orderBy: { firstName: 'asc' }
  });

  return teachers;
};

/**
 * Get available teachers for speaking tests
 */
export const getAvailableTeachers = async () => {
  const teachers = await prisma.teacher.findMany({
    where: {
      isActive: true,
      availableForSpeakingTests: true
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          email: true
        }
      },
      _count: {
        select: {
          speakingSlots: {
            where: {
              status: 'AVAILABLE'
            }
          }
        }
      }
    },
    orderBy: { firstName: 'asc' }
  });

  return teachers;
};