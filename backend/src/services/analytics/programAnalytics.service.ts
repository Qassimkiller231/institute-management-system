// src/services/analytics/programAnalytics.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 3. Program overview (students + groups + venues)
export const getProgramStudentOverview = async (programId: string) => {
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) throw new Error('Program not found');

  const groups = await prisma.group.findMany({
    where: { term: { programId } },
    include: { enrollments: true, venue: true, term: true }
  });

  const distinctStudents = new Set<string>();
  const statusCounts: any = {};
  const groupStats: any[] = [];
  const venueMap: any = {};

  for (const group of groups) {
    const gs: any = {};

    for (const e of group.enrollments) {
      distinctStudents.add(e.studentId);
      const status = e.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      gs[status] = (gs[status] || 0) + 1;

      if (group.venue) {
        const vId = group.venue.id;
        if (!venueMap[vId]) {
          venueMap[vId] = {
            venueId: vId,
            venueName: group.venue.name,
            totalStudents: 0
          };
        }
        venueMap[vId].totalStudents++;
      }
    }

    groupStats.push({
      groupId: group.id,
      groupCode: group.groupCode,
      name: group.name,
      venueId: group.venue?.id || null,
      venueName: group.venue?.name || null,
      totalStudents: group.enrollments.length,
      statusCounts: gs
    });
  }

  return {
    program: {
      id: program.id,
      name: program.name,
      code: program.code
    },
    totalDistinctStudents: distinctStudents.size,
    statusCounts,
    groups: groupStats,
    venues: Object.values(venueMap)
  };
};

// 4. Placement test summary
export const getPlacementTestSummary = async () => {
  const tests = await prisma.test.findMany({
    where: { testType: 'PLACEMENT', isActive: true }
  });

  const ids = tests.map((t) => t.id);
  if (ids.length === 0)
    return { totalSessions: 0, sessions: [], byStatus: {} };

  // Get ALL test sessions regardless of status
  const sessions = await prisma.testSession.findMany({
    where: { testId: { in: ids } },
    include: { student: true, test: true, speakingSlots: true },
    orderBy: { startedAt: 'desc' }
  });

  // Count by status
  const byStatus: any = {};
  sessions.forEach(s => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  const result = sessions.map((s) => ({
    testSessionId: s.id,
    studentId: s.studentId,
    studentName: `${s.student.firstName} ${s.student.secondName || ''}`.trim(),
    testName: s.test.name,
    status: s.status,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    score: s.score ? Number(s.score) : null,
    hasSpeakingSlot: s.speakingSlots.length > 0
  }));

  return {
    totalSessions: sessions.length,
    byStatus,
    sessions: result
  };
};