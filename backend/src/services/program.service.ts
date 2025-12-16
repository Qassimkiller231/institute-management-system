// src/services/program.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== PROGRAMS ====================

export const createProgram = async (data: {
  name: string;
  code: string;
  description?: string;
  duration?: number;
  minAge?: number;
  maxAge?: number;
}) => {
  // Check if code already exists
  const existing = await prisma.program.findUnique({
    where: { code: data.code }
  });

  if (existing) {
    throw new Error('Program code already exists');
  }

  return await prisma.program.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      duration: data.duration,
      minAge: data.minAge,
      maxAge: data.maxAge,
      isActive: true
    }
  });
};

export const getAllPrograms = async (filters: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  // Only filter by isActive if explicitly set
  if (filters.isActive !== undefined) {
    console.log("filters.isActive", filters.isActive);
    where.isActive = filters.isActive;
  }

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        duration: true,
        minAge: true,
        maxAge: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            terms: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.program.count({ where })
  ]);

  return {
    data: programs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getProgramById = async (id: string) => {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      terms: {
        include: {
          _count: {
            select: {
              groups: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      }
    }
  });

  if (!program) {
    throw new Error('Program not found');
  }

  return program;
};

export const updateProgram = async (id: string, updates: {
  name?: string;
  description?: string;
  duration?: number;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
}) => {
  const existing = await prisma.program.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Program not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.duration !== undefined) data.duration = updates.duration;
  if (updates.minAge !== undefined) data.minAge = updates.minAge;
  if (updates.maxAge !== undefined) data.maxAge = updates.maxAge;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.program.update({
    where: { id },
    data
  });
};

export const deleteProgram = async (id: string) => {
  const existing = await prisma.program.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Program not found');
  }

  // Soft delete - just deactivate
  return await prisma.program.update({
    where: { id },
    data: { isActive: false }
  });
};





