// ==================== HALLS ====================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createHall = async (data: {
  venueId: string;
  name: string;
  code: string;
  capacity?: number;
  floor?: string;
}) => {
  // Check if code exists for this venue
  const existing = await prisma.hall.findFirst({
    where: {
      venueId: data.venueId,
      code: data.code
    }
  });

  if (existing) {
    throw new Error('Hall code already exists for this venue');
  }

  return await prisma.hall.create({
    data: {
      venueId: data.venueId,
      name: data.name,
      code: data.code,
      capacity: data.capacity,
      floor: data.floor,
      isActive: true
    }
  });
};

export const getAllHalls = async (filters: {
  venueId?: string;
  isActive?: boolean;
}) => {
  const where: any = {};
  if (filters.venueId) where.venueId = filters.venueId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return await prisma.hall.findMany({
    where,
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      _count: {
        select: {
          classSessions: true
        }
      }
    },
    orderBy: [
      { venue: { name: 'asc' } },
      { floor: 'asc' },
      { name: 'asc' }
    ]
  });
};

export const getHallById = async (id: string) => {
  const hall = await prisma.hall.findUnique({
    where: { id },
    include: {
      venue: true,
      classSessions: {
        include: {
          group: {
            include: {
              level: true
            }
          }
        },
        orderBy: { sessionDate: 'desc' },
        take: 10
      }
    }
  });

  if (!hall) {
    throw new Error('Hall not found');
  }

  return hall;
};

export const updateHall = async (id: string, updates: {
  name?: string;
  capacity?: number;
  floor?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.hall.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Hall not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.capacity !== undefined) data.capacity = updates.capacity;
  if (updates.floor !== undefined) data.floor = updates.floor;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.hall.update({
    where: { id },
    data
  });
};

export const deleteHall = async (id: string) => {
  const existing = await prisma.hall.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Hall not found');
  }

  // Soft delete
  return await prisma.hall.update({
    where: { id },
    data: { isActive: false }
  });
};