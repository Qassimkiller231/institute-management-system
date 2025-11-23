// ==================== TERMS ====================
// src/services/program.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const createTerm = async (data: {
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) => {
  // Validate dates
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  // If this term is current, set all other terms to not current
  if (data.isCurrent) {
    await prisma.term.updateMany({
      where: { programId: data.programId },
      data: { isCurrent: false }
    });
  }

  return await prisma.term.create({
    data: {
      programId: data.programId,
      name: data.name,
      startDate: start,
      endDate: end,
      isCurrent: data.isCurrent || false,
      isActive: true
    }
  });
};

export const getAllTerms = async (filters: {
  programId?: string;
  isCurrent?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.programId) where.programId = filters.programId;
  if (filters.isCurrent !== undefined) where.isCurrent = filters.isCurrent;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [terms, total] = await Promise.all([
    prisma.term.findMany({
      where,
      skip,
      take: limit,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            groups: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    }),
    prisma.term.count({ where })
  ]);

  return {
    data: terms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getTermById = async (id: string) => {
  const term = await prisma.term.findUnique({
    where: { id },
    include: {
      program: true,
      groups: {
        include: {
          level: true,
          teacher: {
            include: {
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        }
      }
    }
  });

  if (!term) {
    throw new Error('Term not found');
  }

  return term;
};

export const updateTerm = async (id: string, updates: {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  isActive?: boolean;
}) => {
  const existing = await prisma.term.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Term not found');
  }

  // If setting this term to current, unset others
  if (updates.isCurrent) {
    await prisma.term.updateMany({
      where: { 
        programId: existing.programId,
        id: { not: id }
      },
      data: { isCurrent: false }
    });
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.startDate) data.startDate = new Date(updates.startDate);
  if (updates.endDate) data.endDate = new Date(updates.endDate);
  if (updates.isCurrent !== undefined) data.isCurrent = updates.isCurrent;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.term.update({
    where: { id },
    data
  });
};
export const deleteTerm = async (id: string) => {
  const existing = await prisma.term.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Term not found');
  }

  // Soft delete - just deactivate
  return await prisma.term.update({
    where: { id },
    data: { isActive: false }
  });
};