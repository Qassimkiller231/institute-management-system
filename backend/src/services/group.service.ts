// src/services/group.service.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== GROUPS ====================

export const createGroup = async (data: {
  termId: string;
  levelId: string;
  teacherId?: string;
  venueId?: string;
  hallId?: string;
  groupCode: string;
  name?: string;
  schedule?: any;
  capacity?: number;
}) => {
  // Check if group code already exists
  const existing = await prisma.group.findUnique({
    where: { groupCode: data.groupCode }
  });

  if (existing) {
    throw new Error('Group code already exists');
  }

  return await prisma.group.create({
    data: {
      termId: data.termId,
      levelId: data.levelId,
      teacherId: data.teacherId,
      venueId: data.venueId,
      hallId: data.hallId,
      groupCode: data.groupCode,
      name: data.name,
      schedule: data.schedule as Prisma.JsonObject,
      capacity: data.capacity || 15,
      isActive: true
    },
    include: {
      term: true,
      level: true,
      teacher: {
        include: {
          user: {
            select: { email: true }
          }
        }
      },
      venue: true,
      hall: true
    }
  });
};

export const getAllGroups = async (filters: {
  termId?: string;
  levelId?: string;
  teacherId?: string;
  venueId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.termId) where.termId = filters.termId;
  if (filters.levelId) where.levelId = filters.levelId;
  if (filters.teacherId) where.teacherId = filters.teacherId;
  if (filters.venueId) where.venueId = filters.venueId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      skip,
      take: limit,
      include: {
        term: {
          include: {
            program: {
              select: { id: true, name: true }
            }
          }
        },
        level: {
          select: { id: true, name: true, displayName: true }
        },
        teacher: {
          include: {
            user: {
              select: { email: true }
            }
          }
        },
        venue: {
          select: { id: true, name: true, code: true }
        },
        hall: {
          select: { id: true, name: true, code: true }
        },
        _count: {
          select: {
            enrollments: true,
            classSessions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.group.count({ where })
  ]);

  return {
    data: groups,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getGroupById = async (id: string) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      term: {
        include: {
          program: true
        }
      },
      level: true,
      teacher: {
        include: {
          user: {
            select: { email: true, phone: true }
          }
        }
      },
      venue: true,
      hall: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      },
      classSessions: {
        where: {
          sessionDate: {
            gte: new Date()
          }
        },
        orderBy: { sessionDate: 'asc' },
        take: 5
      }
    }
  });

  if (!group) {
    throw new Error('Group not found');
  }

  return group;
};

export const updateGroup = async (id: string, updates: {
  name?: string;
  capacity?: number;
  teacherId?: string;
  venueId?: string;
  hallId?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Group not found');
  }

  const data: any = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.capacity !== undefined) data.capacity = updates.capacity;
  if (updates.teacherId !== undefined) data.teacherId = updates.teacherId || null;
  if (updates.venueId !== undefined) data.venueId = updates.venueId || null;
  if (updates.hallId !== undefined) data.hallId = updates.hallId || null;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.group.update({
    where: { id },
    data,
    include: {
      term: {
        include: {
          program: true
        }
      },
      level: true,
      teacher: {
        include: {
          user: {
            select: { email: true }
          }
        }
      },
      venue: true,
      hall: true
    }
  });
};

export const assignTeacher = async (
  groupId: string,
  teacherId: string
) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { teacherId: true }
  });

  if (!group) {
    throw new Error('Group not found');
  }

  // Update the group
  return await prisma.group.update({
    where: { id: groupId },
    data: {
      teacherId: teacherId
    }
  });
};

export const updateSchedule = async (
  groupId: string,
  schedule: any
) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { schedule: true }
  });

  if (!group) {
    throw new Error('Group not found');
  }

  // Update the schedule
  return await prisma.group.update({
    where: { id: groupId },
    data: {
      schedule: schedule as Prisma.JsonObject
    }
  });
};

export const deleteGroup = async (id: string) => {
  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Group not found');
  }

  // Soft delete
  return await prisma.group.update({
    where: { id },
    data: { isActive: false }
  });
};