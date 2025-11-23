// src/services/user.service.ts
import prisma from '../utils/db';
import { User } from '@prisma/client';
import { Role } from '../types/auth.types';

/**
 * Get all users with optional filters
 */
export const getAllUsers = async (filters?: {
  role?: Role;
  isActive?: boolean;
  search?: string;
  limit?: number;
  page?: number;
}) => {
  const { role, isActive, search, limit = 50, page = 1 } = filters || {};

  const where: any = {};
  
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    success: true,
    data: user,
  };
};

/**
 * Update user information
 */
export const updateUser = async (
  userId: string,
  updates: {
    email?: string;
    phone?: string;
    isActive?: boolean;
  }
) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Check for duplicate email/phone if updating
  if (updates.email && updates.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: updates.email },
    });
    
    if (emailExists) {
      // Allow email sharing ONLY between PARENT and STUDENT roles
      const canShareEmail = 
        (existingUser.role === 'STUDENT' && emailExists.role === 'PARENT') ||
        (existingUser.role === 'PARENT' && emailExists.role === 'STUDENT');
      
      if (!canShareEmail) {
        throw new Error('Email already in use');
      }
    }
  }

  if (updates.phone && updates.phone !== existingUser.phone) {
    const phoneExists = await prisma.user.findUnique({
      where: { phone: updates.phone },
    });
    if (phoneExists) {
      throw new Error('Phone number already in use');
    }
  }

  // CASCADE: If deactivating user, also deactivate their Student/Parent profile
  if (updates.isActive === false && existingUser.isActive === true) {
    if (existingUser.role === 'STUDENT') {
      await prisma.student.updateMany({
        where: { userId: userId },
        data: { isActive: false }
      });
    }
    // Parent doesn't have isActive field, so no need to update
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  };
};

/**
 * Delete/deactivate user
 */
export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // CASCADE: Also deactivate Student profile if exists
  if (user.role === 'STUDENT') {
    await prisma.student.updateMany({
      where: { userId: userId },
      data: { isActive: false }
    });
  }
  // Parent doesn't have isActive field

  // Soft delete - just deactivate
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: 'User deactivated successfully',
  };
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (userId: string, newRole: Role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    message: 'User role updated successfully',
    data: updatedUser,
  };
};