// src/services/group.service.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== GROUPS ====================

export const createGroup = async (data: {
  termId: string;
  levelId: string;
  teacherId?: string;
  venueId?: string;
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
      venue: true
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
  isActive?: boolean;
}) => {
  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Group not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.capacity !== undefined) data.capacity = updates.capacity;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.group.update({
    where: { id },
    data
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

// ==================== CLASS SESSIONS ====================

export const createClassSession = async (data: {
  groupId: string;
  hallId?: string;
  sessionNumber: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  topic?: string;
}) => {
  // Check if session already exists for this group and number
  const existing = await prisma.classSession.findFirst({
    where: {
      groupId: data.groupId,
      sessionNumber: data.sessionNumber
    }
  });

  if (existing) {
    throw new Error('Session number already exists for this group');
  }

  return await prisma.classSession.create({
    data: {
      groupId: data.groupId,
      hallId: data.hallId,
      sessionNumber: data.sessionNumber,
      sessionDate: new Date(data.sessionDate),
      startTime: new Date(`1970-01-01T${data.startTime}`),
      endTime: new Date(`1970-01-01T${data.endTime}`),
      topic: data.topic,
      status: 'SCHEDULED'
    }
  });
};

export const bulkCreateSessions = async (data: {
  groupId: string;
  hallId?: string;
  startDate: string;
  schedule: {
    days: string[];
    time: string;
  };
  totalSessions: number;
}) => {
  // Parse time (e.g., "18:00-20:00")
  const [startTime, endTime] = data.schedule.time.split('-');

  // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const scheduleDays = data.schedule.days.map(day => dayMap[day]);
  
  const sessions = [];
  let currentDate = new Date(data.startDate);
  let sessionNumber = 1;

  while (sessionNumber <= data.totalSessions) {
    const dayOfWeek = currentDate.getDay();

    if (scheduleDays.includes(dayOfWeek)) {
      sessions.push({
        groupId: data.groupId,
        hallId: data.hallId,
        sessionNumber: sessionNumber,
        sessionDate: new Date(currentDate),
        startTime: new Date(`1970-01-01T${startTime}`),
        endTime: new Date(`1970-01-01T${endTime}`),
        status: 'SCHEDULED'
      });
      sessionNumber++;
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create all sessions
  await prisma.classSession.createMany({
    data: sessions
  });

  return {
    totalCreated: sessions.length,
    firstSession: sessions[0].sessionDate,
    lastSession: sessions[sessions.length - 1].sessionDate
  };
};

export const getSessionsByGroup = async (
  groupId: string,
  filters?: {
    status?: string;
    limit?: number;
  }
) => {
  const where: any = { groupId: groupId };
  if (filters?.status) {
    where.status = filters.status;
  }

  return await prisma.classSession.findMany({
    where,
    include: {
      hall: {
        select: {
          id: true,
          name: true,
          venue: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: {
          attendance: true
        }
      }
    },
    orderBy: { sessionNumber: 'asc' },
    take: filters?.limit || 100
  });
};

export const updateClassSession = async (id: string, updates: {
  sessionDate?: string;
  hallId?: string;
  startTime?: string;
  endTime?: string;
  topic?: string;
  status?: string;
}) => {
  const existing = await prisma.classSession.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Class session not found');
  }

  const data: any = {};
  if (updates.sessionDate) data.sessionDate = new Date(updates.sessionDate);
  if (updates.hallId !== undefined) data.hallId = updates.hallId;
  if (updates.startTime) data.startTime = new Date(`1970-01-01T${updates.startTime}`);
  if (updates.endTime) data.endTime = new Date(`1970-01-01T${updates.endTime}`);
  if (updates.topic !== undefined) data.topic = updates.topic;
  if (updates.status) data.status = updates.status;

  return await prisma.classSession.update({
    where: { id },
    data
  });
};

export const completeSession = async (
  id: string,
  topic?: string
) => {
  const existing = await prisma.classSession.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Class session not found');
  }

  return await prisma.classSession.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      topic: topic
    }
  });
};

export const cancelSession = async (
  id: string,
  reason: string
) => {
  const existing = await prisma.classSession.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Class session not found');
  }

  return await prisma.classSession.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason
    }
  });
};

// ==================== SCHEDULE MANAGEMENT ====================

export const checkScheduleConflicts = async (
  venueId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeGroupId?: string
) => {
  const targetDate = new Date(date);

  // Get all sessions on this date at this venue
  const sessions = await prisma.classSession.findMany({
    where: {
      sessionDate: targetDate,
      group: {
        venueId: venueId,
        id: excludeGroupId ? { not: excludeGroupId } : undefined
      }
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          groupCode: true
        }
      },
      hall: {
        select: {
          name: true
        }
      }
    }
  });

  // Check for time overlaps
  const conflicts = sessions.filter(session => {
    const sessionStart = session.startTime.toISOString().split('T')[1];
    const sessionEnd = session.endTime.toISOString().split('T')[1];

    // Check if times overlap
    return (
      (startTime >= sessionStart && startTime < sessionEnd) ||
      (endTime > sessionStart && endTime <= sessionEnd) ||
      (startTime <= sessionStart && endTime >= sessionEnd)
    );
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts: conflicts.map(c => ({
      groupId: c.group.id,
      groupName: c.group.name || c.group.groupCode,
      hallName: c.hall?.name,
      time: `${c.startTime.toISOString().split('T')[1]}-${c.endTime.toISOString().split('T')[1]}`
    }))
  };
};