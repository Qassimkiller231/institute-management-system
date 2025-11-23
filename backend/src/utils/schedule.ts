
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