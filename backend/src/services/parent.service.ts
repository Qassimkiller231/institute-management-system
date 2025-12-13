// src/services/parent.service.ts
import { PrismaClient } from '@prisma/client';
import { normalizePhoneNumber, validatePhoneNumber } from '../utils/phone.utils';

const prisma = new PrismaClient();

/**
 * Create a new parent
 */
export const createParent = async (data: {
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
}) => {
  let userId: string | undefined;

  // Check if email already exists
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      // If role is PARENT or STUDENT, check if Parent already exists
      if (existingUser.role === 'PARENT' || existingUser.role === 'STUDENT') {
        // Check if Parent already exists for this user
        const existingParent = await prisma.parent.findUnique({
          where: { userId: existingUser.id }
        });

        if (existingParent) {
          throw new Error('Parent already exists with this email');
        }

        userId = existingUser.id;
      } else {
        throw new Error('Email already in use by another user');
      }
    }
  }

  // Create User and Parent in a transaction
  const result = await prisma.$transaction(async (tx) => {
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

    // Create User only if userId doesn't exist
    if (!userId) {
      const user = await tx.user.create({
        data: {
          email: data.email || `parent-${Date.now()}@placeholder.local`,
          phone: normalizedPhone,
          role: 'PARENT',
          isActive: true
        }
      });
      userId = user.id;
    }

    // Create Parent
    const parent = await tx.parent.create({
      data: {
        userId: userId,
        firstName: data.firstName,
        lastName: data.lastName
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

    return parent;
  });

  return result;
};

/**
 * Get all parents with filters and pagination
 */
export const getAllParents = async (filters: {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Filter by user isActive
  if (filters.isActive !== undefined) {
    where.user = { isActive: filters.isActive };
  }

  // Search by name
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } }
    ];
  }

  const [parents, total] = await Promise.all([
    prisma.parent.findMany({
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
        _count: {
          select: {
            parentStudentLinks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.parent.count({ where })
  ]);

  return {
    data: parents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get parent by ID with full details
 */
export const getParentById = async (id: string) => {
  const parent = await prisma.parent.findUnique({
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
      parentStudentLinks: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              secondName: true,
              thirdName: true,
              cpr: true,
              email: true,
              gender: true,
              isActive: true
            }
          }
        }
      },
      phones: {
        select: {
          id: true,
          phoneNumber: true,
          countryCode: true,
          isPrimary: true
        }
      },
      _count: {
        select: {
          parentStudentLinks: true
        }
      }
    }
  });

  if (!parent) {
    throw new Error('Parent not found');
  }

  return parent;
};

/**
 * Update parent information
 */
export const updateParent = async (id: string, updates: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.parent.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Parent not found');
  }

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // CASCADE: If activating/deactivating parent, do the same to user
    if (updates.isActive !== undefined && updates.isActive !== existing.user.isActive) {
      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: updates.isActive }
      });
    }

    // Check email uniqueness if changing email
    if (updates.email && updates.email !== existing.user.email) {
      const existingEmail = await tx.user.findUnique({
        where: { email: updates.email }
      });

      if (existingEmail && existingEmail.id !== existing.userId) {
        if (existingEmail.role !== 'PARENT' && existingEmail.role !== 'STUDENT') {
          throw new Error('Email already in use by another user');
        }
      } else if (!existingEmail || existingEmail.id === existing.userId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { email: updates.email }
        });
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

      const existingPhone = await tx.user.findUnique({
        where: { phone: normalizedPhone }
      });

      if (existingPhone && existingPhone.id !== existing.userId) {
        throw new Error('Phone number already in use');
      }

      await tx.user.update({
        where: { id: existing.userId },
        data: { phone: normalizedPhone }
      });
    }

    // Update Parent data
    const parentData: any = {};
    if (updates.firstName !== undefined) parentData.firstName = updates.firstName;
    if (updates.lastName !== undefined) parentData.lastName = updates.lastName;

    const parent = await tx.parent.update({
      where: { id },
      data: parentData,
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

    return parent;
  });

  return result;
};

/**
 * Deactivate parent (soft delete)
 */
export const deleteParent = async (id: string) => {
  const existing = await prisma.parent.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing) {
    throw new Error('Parent not found');
  }

  // Deactivate User only
  await prisma.user.update({
    where: { id: existing.userId },
    data: { isActive: false }
  });

  return { message: 'Parent deactivated successfully' };
};

/**
 * Link student to parent
 */
export const linkStudent = async (parentId: string, data: {
  studentId: string;
  relationship?: string;
}) => {
  const parent = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!parent) {
    throw new Error('Parent not found');
  }

  const student = await prisma.student.findUnique({ where: { id: data.studentId } });
  if (!student) {
    throw new Error('Student not found');
  }

  const existingLink = await prisma.parentStudentLink.findFirst({
    where: {
      parentId: parentId,
      studentId: data.studentId
    }
  });

  if (existingLink) {
    throw new Error('Student is already linked to this parent');
  }

  const link = await prisma.parentStudentLink.create({
    data: {
      parentId: parentId,
      studentId: data.studentId,
      relationship: data.relationship
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          secondName: true,
          thirdName: true,
          cpr: true,
          email: true
        }
      }
    }
  });

  return link;
};

/**
 * Search parents by name or email
 */
export const searchParents = async (query: string, limit: number = 20) => {
  const parents = await prisma.parent.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { user: { email: { contains: query, mode: 'insensitive' } } }
      ],
      user: { isActive: true }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
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

  return parents;
};