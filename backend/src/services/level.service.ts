// src/services/program.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== LEVELS ====================

export const createLevel = async (data: {
  name: string;
  displayName?: string;
  orderNumber?: number;
  description?: string;
  isMixed?: boolean;
  mixedLevels?: string;
}) => {
  // Check if name already exists
  const existing = await prisma.level.findUnique({
    where: { name: data.name }
  });

  if (existing) {
    throw new Error('Level name already exists');
  }

  return await prisma.level.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      orderNumber: data.orderNumber,
      description: data.description,
      isMixed: data.isMixed || false,
      mixedLevels: data.mixedLevels
    }
  });
};

export const getAllLevels = async () => {
  return await prisma.level.findMany({
    include: {
      _count: {
        select: {
          groups: true
        }
      }
    },
    orderBy: { orderNumber: 'asc' }
  });
};

export const getLevelById = async (id: string) => {
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      groups: {
        include: {
          term: {
            include: {
              program: true
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

  if (!level) {
    throw new Error('Level not found');
  }

  return level;
};

export const updateLevel = async (id: string, updates: {
  displayName?: string;
  description?: string;
  orderNumber?: number;
  isMixed?: boolean;
  mixedLevels?: string;
}) => {
  const existing = await prisma.level.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Level not found');
  }

  const data: any = {};
  if (updates.displayName !== undefined) data.displayName = updates.displayName;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.orderNumber !== undefined) data.orderNumber = updates.orderNumber;
  if (updates.isMixed !== undefined) data.isMixed = updates.isMixed;
  if (updates.mixedLevels !== undefined) data.mixedLevels = updates.mixedLevels;

  return await prisma.level.update({
    where: { id },
    data
  });
};
export const deleteLevel = async (id: string) => {
  const existing = await prisma.level.findUnique({
    where: { id },
    include: { _count: { select: { groups: true } } }
  });

  if (!existing) {
    throw new Error('Level not found');
  }

  if (existing._count.groups > 0) {
    throw new Error('Cannot delete level - groups are using it');
  }

  return await prisma.level.delete({ where: { id } });
};
