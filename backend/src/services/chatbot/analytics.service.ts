import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ATTENDED_STATUSES = ['PRESENT', 'LATE'];

/**
 * Get specific data based on query type (ADMIN ONLY)
 */
export const getSpecificData = async (
  userId: string,
  userRole: string,
  queryType: string,
  message: string
): Promise<string | null> => {
  try {
    // Only process for ADMIN
    if (userRole !== 'ADMIN') {
      return null;
    }

    switch (queryType) {
      case 'ATTENDANCE':
        return await getOverallAttendanceData();
      case 'PAYMENT':
        return await getOverallPaymentData();
      case 'SCHEDULE':
        return await getScheduleOverview();
      default:
        return null;
    }
  } catch (error) {
    console.error('Analytics service error:', error);
    return null;
  }
};

/**
 * Get overall attendance data (ADMIN)
 */
async function getOverallAttendanceData(): Promise<string> {
  const allAttendance = await prisma.attendance.findMany();
  const total = allAttendance.length;
  const present = allAttendance.filter(a => ATTENDED_STATUSES.includes(a.status)).length;
  const avgPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  // Get at-risk students (< 75%)
  const students = await prisma.student.findMany({
    where: { isActive: true }
  });

  let atRiskCount = 0;
  for (const student of students) {
    const studentAttendance = await prisma.attendance.findMany({
      where: { studentId: student.id }
    });

    if (studentAttendance.length > 0) {
      const studentPresent = studentAttendance.filter(a =>
        ATTENDED_STATUSES.includes(a.status)
      ).length;
      const studentPercentage = (studentPresent / studentAttendance.length) * 100;

      if (studentPercentage < 75) {
        atRiskCount++;
      }
    }
  }

  return `📊 **Overall Attendance:**
- Average Attendance: ${avgPercentage}%
- Total Records: ${total}
- At-Risk Students (< 75%): ${atRiskCount}
- Active Students: ${students.length}`;
}

/**
 * Get overall payment data (ADMIN)
 */
async function getOverallPaymentData(): Promise<string> {
  const allPlans = await prisma.studentPaymentPlan.findMany({
    include: { installments: true }
  });

  let totalExpected = 0;
  let totalPaid = 0;
  let unpaidStudents = 0;

  for (const plan of allPlans) {
    const expected = Number(plan.finalAmount);
    const paid = plan.installments.reduce((sum, i) => sum + Number(i.amount), 0);

    totalExpected += expected;
    totalPaid += paid;

    if (paid < expected) {
      unpaidStudents++;
    }
  }

  const balance = totalExpected - totalPaid;
  const collectionRate = totalExpected > 0
    ? ((totalPaid / totalExpected) * 100).toFixed(1)
    : '0';

  return `💰 **Financial Summary:**
- Total Expected: BHD ${totalExpected.toFixed(2)}
- Total Collected: BHD ${totalPaid.toFixed(2)}
- Outstanding: BHD ${balance.toFixed(2)}
- Collection Rate: ${collectionRate}%
- Students with Pending Payments: ${unpaidStudents}`;
}

/**
 * Get schedule overview (ADMIN)
 */
async function getScheduleOverview(): Promise<string> {
  const today = new Date();

  const upcomingSessions = await prisma.classSession.findMany({
    where: {
      sessionDate: { gte: today }
    },
    include: {
      group: {
        include: {
          level: true,
          teacher: true,
          venue: true
        }
      }
    },
    orderBy: { sessionDate: 'asc' },
    take: 10
  });

  if (upcomingSessions.length === 0) {
    return "No upcoming classes scheduled.";
  }

  let schedule = '📅 **Upcoming Classes (Next 10):**\n\n';

  upcomingSessions.forEach(session => {
    const group = session.group;
    schedule += `**${group.name || group.groupCode}**\n`;
    schedule += `- Date: ${session.sessionDate.toLocaleDateString()}\n`;
    schedule += `- Time: ${session.startTime} - ${session.endTime}\n`;
    schedule += `- Level: ${group.level.name}\n`;
    schedule += `- Teacher: ${group.teacher?.firstName} ${group.teacher?.lastName}\n`;
    schedule += `- Venue: ${group.venue?.name}\n\n`;
  });

  return schedule;
}

/**
 * Get comprehensive database context for Claude AI (ADMIN ONLY)
 * This provides real-time statistics so Claude can answer questions accurately
 */
export const getDatabaseContext = async (): Promise<string> => {
  try {
    // Get counts
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalGroups,
      activeGroups,
      totalTerms,
      totalPrograms,
      programs,
      levels
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count(),
      prisma.group.count(),
      prisma.group.count({ where: { isActive: true } }),
      prisma.term.count(),
      prisma.program.count(),
      prisma.program.findMany({ select: { name: true, code: true } }),
      prisma.level.findMany({ select: { name: true, displayName: true } })
    ]);

    // Get payment summary
    const allPlans = await prisma.studentPaymentPlan.findMany({
      include: { installments: true }
    });

    let totalExpected = 0;
    let totalPaid = 0;
    let overdueCount = 0;
    const today = new Date();

    for (const plan of allPlans) {
      const expected = Number(plan.finalAmount);
      const paidInstallments = plan.installments.filter(i => i.paymentDate !== null);
      const paid = paidInstallments.reduce((sum, i) => sum + Number(i.amount), 0);

      totalExpected += expected;
      totalPaid += paid;

      // Check for overdue installments
      const overdueInstallments = plan.installments.filter(i =>
        !i.paymentDate && i.dueDate && new Date(i.dueDate) < today
      );
      if (overdueInstallments.length > 0) {
        overdueCount++;
      }
    }

    // Get attendance overview
    const allAttendance = await prisma.attendance.findMany();
    const attended = allAttendance.filter(a => ATTENDED_STATUSES.includes(a.status)).length;
    const avgAttendance = allAttendance.length > 0
      ? ((attended / allAttendance.length) * 100).toFixed(1)
      : '0';

    // Get today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysSessions = await prisma.classSession.count({
      where: {
        sessionDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Format programs list
    const programsList = programs.map(p => `${p.name} (${p.code})`).join(', ');

    // Format levels list
    const levelsList = levels.map(l => `${l.name} (${l.displayName})`).join(', ');

    return `
📊 **CURRENT INSTITUTE DATABASE CONTEXT:**

**Students:**
- Total: ${totalStudents}
- Active: ${activeStudents}
- Inactive: ${totalStudents - activeStudents}

**Staff & Classes:**
- Teachers: ${totalTeachers}
- Total Groups: ${totalGroups}
- Active Groups: ${activeGroups}
- Today's Classes: ${todaysSessions}

**Academic:**
- Programs (${totalPrograms}): ${programsList}
- Levels (${levels.length}): ${levelsList}
- Terms: ${totalTerms}

**Finances:**
- Total Expected: BHD ${totalExpected.toFixed(2)}
- Total Collected: BHD ${totalPaid.toFixed(2)}
- Outstanding: BHD ${(totalExpected - totalPaid).toFixed(2)}
- Students with Overdue Payments: ${overdueCount}

**Attendance:**
- Overall Attendance Rate: ${avgAttendance}%
- Total Attendance Records: ${allAttendance.length}

Use this data to answer the admin's questions accurately.
`;
  } catch (error) {
    console.error('Error getting database context:', error);
    return 'Database context unavailable at this moment.';
  }
};