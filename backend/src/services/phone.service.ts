// src/services/phone.service.ts
import { PrismaClient } from '@prisma/client';
import { normalizePhoneNumber, validatePhoneNumber } from '../utils/phone.utils';

const prisma = new PrismaClient();

/**
 * Add phone number
 */
export const addPhone = async (data: {
  phoneNumber: string;
  countryCode?: string;
  isPrimary?: boolean;
  ownerId: string;
  ownerType: 'PARENT' | 'STUDENT';
}) => {
  // Verify owner exists
  if (data.ownerType === 'PARENT') {
    const parent = await prisma.parent.findUnique({ where: { id: data.ownerId } });
    if (!parent) {
      throw new Error('Parent not found');
    }
  } else {
    const student = await prisma.student.findUnique({ where: { id: data.ownerId } });
    if (!student) {
      throw new Error('Student not found');
    }
  }

  // Normalize and validate phone number
  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhoneNumber(data.phoneNumber);
    if (!validatePhoneNumber(data.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Invalid phone number');
  }

  // Check if phone already exists
  const existingPhone = await prisma.phone.findUnique({
    where: { phoneNumber: normalizedPhone }
  });

  if (existingPhone) {
    throw new Error('Phone number already exists');
  }

  // If this is primary, unset other primary phones for this owner
  if (data.isPrimary) {
    const where = data.ownerType === 'PARENT'
      ? { parentId: data.ownerId, isPrimary: true }
      : { studentId: data.ownerId, isPrimary: true };

    await prisma.phone.updateMany({
      where,
      data: { isPrimary: false }
    });
  }

  // Create phone
  const phoneData: any = {
    phoneNumber: normalizedPhone,
    countryCode: data.countryCode || '+973',
    isPrimary: data.isPrimary || false,
    isActive: true
  };

  if (data.ownerType === 'PARENT') {
    phoneData.parentId = data.ownerId;
  } else {
    phoneData.studentId = data.ownerId;
  }

  const phone = await prisma.phone.create({
    data: phoneData,
    include: {
      parent: data.ownerType === 'PARENT' ? {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      } : undefined,
      student: data.ownerType === 'STUDENT' ? {
        select: {
          id: true,
          firstName: true,
          secondName: true,
          thirdName: true
        }
      } : undefined
    }
  });

  return phone;
};

/**
 * Get all phones with filters
 */
export const getAllPhones = async (filters: {
  isActive?: boolean;
  isPrimary?: boolean;
  parentId?: string;
  studentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isPrimary !== undefined) where.isPrimary = filters.isPrimary;
  if (filters.parentId) where.parentId = filters.parentId;
  if (filters.studentId) where.studentId = filters.studentId;

  if (filters.search) {
    where.phoneNumber = { contains: filters.search };
  }

  const [phones, total] = await Promise.all([
    prisma.phone.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            thirdName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.phone.count({ where })
  ]);

  return {
    data: phones,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get phone by ID
 */
export const getPhoneById = async (id: string) => {
  const phone = await prisma.phone.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true
            }
          }
        }
      },
      student: {
        select: {
          id: true,
          firstName: true,
          secondName: true,
          thirdName: true,
          cpr: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    }
  });

  if (!phone) {
    throw new Error('Phone not found');
  }

  return phone;
};

/**
 * Update phone
 */
export const updatePhone = async (id: string, updates: {
  phoneNumber?: string;
  countryCode?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
}) => {
  const existing = await prisma.phone.findUnique({ where: { id } });

  if (!existing) {
    throw new Error('Phone not found');
  }

  // Check phone number uniqueness if changing
  if (updates.phoneNumber && updates.phoneNumber !== existing.phoneNumber) {
    // Normalize the new phone number
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(updates.phoneNumber);
      if (!validatePhoneNumber(updates.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid phone number');
    }

    const existingPhone = await prisma.phone.findUnique({
      where: { phoneNumber: normalizedPhone }
    });

    if (existingPhone) {
      throw new Error('Phone number already exists');
    }

    // Update the phoneNumber in updates to use normalized version
    updates.phoneNumber = normalizedPhone;
  }

  // If setting as primary, unset other primary phones for same owner
  if (updates.isPrimary === true) {
    const where = existing.parentId
      ? { parentId: existing.parentId, isPrimary: true, id: { not: id } }
      : { studentId: existing.studentId!, isPrimary: true, id: { not: id } };

    await prisma.phone.updateMany({
      where,
      data: { isPrimary: false }
    });
  }

  const data: any = {};
  if (updates.phoneNumber !== undefined) data.phoneNumber = updates.phoneNumber;
  if (updates.countryCode !== undefined) data.countryCode = updates.countryCode;
  if (updates.isPrimary !== undefined) data.isPrimary = updates.isPrimary;
  if (updates.isVerified !== undefined) data.isVerified = updates.isVerified;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  const phone = await prisma.phone.update({
    where: { id },
    data,
    include: {
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      student: {
        select: {
          id: true,
          firstName: true,
          secondName: true,
          thirdName: true
        }
      }
    }
  });

  return phone;
};

/**
 * Delete phone (soft delete)
 */
export const deletePhone = async (id: string) => {
  const existing = await prisma.phone.findUnique({ where: { id } });

  if (!existing) {
    throw new Error('Phone not found');
  }

  await prisma.phone.update({
    where: { id },
    data: { isActive: false }
  });

  return { message: 'Phone deleted successfully' };
};