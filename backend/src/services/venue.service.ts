// ==================== VENUES ====================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const createVenue = async (data: {
  name: string;
  code: string;
  address?: string;
  isActive?:boolean;
}) => {
  const existing = await prisma.venue.findUnique({
    where: { code: data.code }
  });

  if (existing) {
    throw new Error('Venue code already exists');
  }

  return await prisma.venue.create({
    data: {
      name: data.name,
      code: data.code,
      address: data.address,
      isActive: data.isActive? data.isActive : false
    }
  });
};

export const getAllVenues = async (filters: {
  isActive?: boolean;
}) => {
  const where: any = {};
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return await prisma.venue.findMany({
    where,
    include: {
      halls: {
        where: { isActive: true }
      },
      _count: {
        select: {
          halls: true,
          groups: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const getVenueById = async (id: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      halls: true,
      groups: {
        include: {
          level: true,
          term: true
        }
      }
    }
  });

  if (!venue) {
    throw new Error('Venue not found');
  }

  return venue;
};

export const updateVenue = async (id: string, updates: {
  name?: string;
  address?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Venue not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.address !== undefined) data.address = updates.address;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.venue.update({
    where: { id },
    data
  });
};
export const deleteVenue = async (id: string) => {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Venue not found');
  }

  // Soft delete - just deactivate
  return await prisma.venue.update({
    where: { id },
    data: { isActive: false }
  });
};