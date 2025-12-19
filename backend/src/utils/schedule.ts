
// ==================== SCHEDULE MANAGEMENT ====================
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
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

/**
 * Check for teacher schedule conflicts
 * Prevents teachers from being double-booked at the same time
 */
export const checkTeacherConflicts = async (
  teacherId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeGroupId?: string
) => {
  const targetDate = new Date(date);

  // Get all sessions for this teacher on this date
  const sessions = await prisma.classSession.findMany({
    where: {
      sessionDate: targetDate,
      group: {
        teacherId: teacherId,
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
    // Extract time portion from stored UTC times (HH:MM:SS)
    const sessionStart = session.startTime.toISOString().split('T')[1].substring(0, 8);
    const sessionEnd = session.endTime.toISOString().split('T')[1].substring(0, 8);

    // Convert incoming times to UTC for comparison
    const incomingStart = new Date(`1970-01-01T${startTime}`).toISOString().split('T')[1].substring(0, 8);
    const incomingEnd = new Date(`1970-01-01T${endTime}`).toISOString().split('T')[1].substring(0, 8);

    console.log('🔍 Checking conflict:');
    console.log('  Incoming (original):', { startTime, endTime });
    console.log('  Incoming (UTC):', { incomingStart, incomingEnd });
    console.log('  Existing (UTC):', { sessionStart, sessionEnd });

    // Check if times overlap (same logic as venue conflicts)
    const hasConflict = (
      (incomingStart >= sessionStart && incomingStart < sessionEnd) ||
      (incomingEnd > sessionStart && incomingEnd <= sessionEnd) ||
      (incomingStart <= sessionStart && incomingEnd >= sessionEnd)
    );

    console.log('  Overlap:', hasConflict);

    return hasConflict;
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