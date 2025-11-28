// src/services/session.service.ts
import { PrismaClient } from "@prisma/client";
import { checkScheduleConflicts } from "../utils/schedule";

const prisma = new PrismaClient();

/**
 * Create a single class session
 */
export const createSession = async (data: {
  groupId: string;
  hallId?: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  topic?: string;
}) => {
  // Verify group exists
  const group = await prisma.group.findUnique({ where: { id: data.groupId } });
  if (!group) {
    throw new Error("Group not found");
  }

  // Check for conflicts if venue exists
  if (group.venueId) {
    const conflicts = await checkScheduleConflicts(
      group.venueId,
      data.sessionDate,
      data.startTime,
      data.endTime
    );

    if (conflicts.hasConflicts) {
      throw new Error(
        `Schedule conflict detected: ${conflicts.conflicts
          .map((c) => c.groupName)
          .join(", ")}`
      );
    }
  }

  // ❌ MISSING in createSession service:

  // 1. Validate hallId if provided
  if (data.hallId) {
    const hall = await prisma.hall.findUnique({
      where: { id: data.hallId, isActive: true },
    });
    if (!hall) {
      throw new Error("Hall not found or inactive");
    }
  }

  // 2. Validate time range
  const startTime = new Date(`1970-01-01T${data.startTime}`);
  const endTime = new Date(`1970-01-01T${data.endTime}`);
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }

  // 3. Validate sessionNumber
  if (data.sessionNumber <= 0) {
    throw new Error("Session number must be greater than 0");
  }

  // 4. Validate sessionDate is not in past
  const sessionDate = new Date(data.sessionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (sessionDate < today) {
    throw new Error("Cannot create sessions in the past");
  }

  const session = await prisma.classSession.create({
    data: {
      groupId: data.groupId,
      hallId: data.hallId,
      sessionDate: new Date(data.sessionDate),
      sessionNumber: data.sessionNumber,
      startTime: new Date(`1970-01-01T${data.startTime}`),
      endTime: new Date(`1970-01-01T${data.endTime}`),
      topic: data.topic,
      status: "SCHEDULED",
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          groupCode: true,
        },
      },
      hall: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return session;
};

/**
 * Bulk create sessions for a group
 */
export const bulkCreateSessions = async (data: {
  groupId: string;
  sessions: Array<{
    sessionDate: string;
    sessionNumber: number;
    startTime: string;
    endTime: string;
    hallId?: string;
    topic?: string;
  }>;
}) => {
  // Verify group exists
  const group = await prisma.group.findUnique({ where: { id: data.groupId } });
  if (!group) {
    throw new Error("Group not found");
  }

  const createdSessions = await prisma.$transaction(
    data.sessions.map((session) =>
      prisma.classSession.create({
        data: {
          groupId: data.groupId,
          hallId: session.hallId,
          sessionDate: new Date(session.sessionDate),
          sessionNumber: session.sessionNumber,
          startTime: new Date(`1970-01-01T${session.startTime}`),
          endTime: new Date(`1970-01-01T${session.endTime}`),
          topic: session.topic,
          status: "SCHEDULED",
        },
      })
    )
  );

  return {
    created: createdSessions.length,
    sessions: createdSessions,
  };
};

/**
 * Get all sessions with filters
 */
export const getAllSessions = async (filters: {
  groupId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.groupId) where.groupId = filters.groupId;
  if (filters.status) where.status = filters.status;

  if (filters.dateFrom || filters.dateTo) {
    where.sessionDate = {};
    if (filters.dateFrom) where.sessionDate.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.sessionDate.lte = new Date(filters.dateTo);
  }

  const [sessions, total] = await Promise.all([
    prisma.classSession.findMany({
      where,
      skip,
      take: limit,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            groupCode: true,
            level: {
              select: {
                name: true,
                displayName: true,
              },
            },
          },
        },
        hall: {
          select: {
            id: true,
            name: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: { sessionDate: "asc" },
    }),
    prisma.classSession.count({ where }),
  ]);

  return {
    data: sessions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get session by ID
 */
export const getSessionById = async (id: string) => {
  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      group: {
        include: {
          level: true,
          term: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          venue: true,
        },
      },
      hall: true,
      attendance: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              secondName: true,
              thirdName: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
};

/**
 * Get sessions by group
 */
export const getSessionsByGroup = async (groupId: string) => {
  const sessions = await prisma.classSession.findMany({
    where: { groupId },
    include: {
      hall: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
    orderBy: { sessionDate: "asc" },
  });

  return sessions;
};

/**
 * Update session
 */
export const updateSession = async (
  id: string,
  updates: {
    hallId?: string;
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    topic?: string;
    status?: string;
  }
) => {
  const existing = await prisma.classSession.findUnique({
    where: { id },
    include: { group: true },
  });

  if (!existing) {
    throw new Error("Session not found");
  }

  const data: any = {};
  if (updates.hallId !== undefined) data.hallId = updates.hallId;
  if (updates.sessionDate) data.sessionDate = new Date(updates.sessionDate);
  if (updates.startTime)
    data.startTime = new Date(`1970-01-01T${updates.startTime}`);
  if (updates.endTime) data.endTime = new Date(`1970-01-01T${updates.endTime}`);
  if (updates.topic !== undefined) data.topic = updates.topic;
  if (updates.status) data.status = updates.status;

  const session = await prisma.classSession.update({
    where: { id },
    data,
    include: {
      group: {
        select: {
          id: true,
          name: true,
          groupCode: true,
        },
      },
      hall: {
        select: {
          name: true,
        },
      },
    },
  });

  return session;
};

/**
 * Mark session as completed
 */
export const completeSession = async (id: string) => {
  const existing = await prisma.classSession.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Session not found");
  }

  if (existing.status === "COMPLETED") {
    throw new Error("Session is already completed");
  }

  if (existing.status === "CANCELLED") {
    throw new Error("Cannot complete a cancelled session");
  }

  const session = await prisma.classSession.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  return session;
};

/**
 * Cancel session
 */
export const cancelSession = async (id: string, reason?: string) => {
  const existing = await prisma.classSession.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Session not found");
  }

  if (existing.status === "COMPLETED") {
    throw new Error("Cannot cancel a completed session");
  }

  if (existing.status === "CANCELLED") {
    throw new Error("Session is already cancelled");
  }

  const session = await prisma.classSession.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
    },
  });

  return session;
};
