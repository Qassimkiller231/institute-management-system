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
 * This provides real-time statistics AND specific actionable lists so Claude can answer "Who?" questions.
 */
export const getDatabaseContext = async (): Promise<string> => {
  try {
    // 1. Basic Counts
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalGroups,
      activeGroups,
      programs,
      levels
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count(),
      prisma.group.count(),
      prisma.group.count({ where: { isActive: true } }),
      prisma.program.findMany({ select: { name: true, code: true } }),
      prisma.level.findMany({ select: { name: true, displayName: true } })
    ]);

    // 2. Financial Context & Overdue List
    const allPlans = await prisma.studentPaymentPlan.findMany({
      include: {
        installments: true,
        enrollment: {
          include: { student: { select: { firstName: true, secondName: true, thirdName: true, cpr: true } } }
        }
      }
    });

    let totalExpected = 0;
    let totalPaid = 0;
    let overdueCount = 0;
    const overdueList: string[] = [];
    const today = new Date();

    for (const plan of allPlans) {
      const expected = Number(plan.finalAmount);
      const paidInstallments = plan.installments.filter(i => i.paymentDate !== null);
      const paid = paidInstallments.reduce((sum, i) => sum + Number(i.amount), 0);

      totalExpected += expected;
      totalPaid += paid;

      // Check for overdue installments
      const overdueItems = plan.installments.filter(i =>
        !i.paymentDate && i.dueDate && new Date(i.dueDate) < today
      );

      if (overdueItems.length > 0) {
        overdueCount++;
        const amountOverdue = overdueItems.reduce((sum, i) => sum + Number(i.amount), 0);
        const name = `${plan.enrollment.student.firstName} ${plan.enrollment.student.secondName || ''} ${plan.enrollment.student.thirdName || ''}`.trim();
        overdueList.push(`- ${name} (CPR: ${plan.enrollment.student.cpr}): BHD ${amountOverdue.toFixed(2)} overdue`);
      }
    }

    // Limit overdue list to top 20 to save tokens
    const overdueListStr = overdueList.slice(0, 20).join('\n');
    const overdueMore = overdueList.length > 20 ? `\n...and ${overdueList.length - 20} more.` : '';

    // 3. Attendance Context & At-Risk List
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, secondName: true, thirdName: true, cpr: true }
    });

    let lowAttendanceCount = 0;
    const lowAttendanceList: string[] = [];

    for (const student of students) {
      const attendance = await prisma.attendance.findMany({
        where: { studentId: student.id }
      });

      if (attendance.length > 0) {
        const attended = attendance.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
        const pct = (attended / attendance.length) * 100;

        if (pct < 75) {
          lowAttendanceCount++;
          const name = `${student.firstName} ${student.secondName || ''} ${student.thirdName || ''}`.trim();
          lowAttendanceList.push(`- ${name}: ${pct.toFixed(1)}%`);
        }
      }
    }

    const lowAttendanceListStr = lowAttendanceList.slice(0, 20).join('\n');
    const lowAttendanceMore = lowAttendanceList.length > 20 ? `\n...and ${lowAttendanceList.length - 20} more.` : '';


    // Format output
    return `
📊 **CURRENT INSTITUTE DATABASE CONTEXT:**

**Students:**
- Total: ${totalStudents}
- Active: ${activeStudents}
- Inactive: ${totalStudents - activeStudents}

**Staff & Classes:**
- Teachers: ${totalTeachers}
- Active Groups: ${activeGroups}

**Academic Structure:**
- Programs: ${programs.map(p => p.name).join(', ')}

**Finances:**
- Total Expected: BHD ${totalExpected.toFixed(2)}
- Total Collected: BHD ${totalPaid.toFixed(2)}
- Outstanding: BHD ${(totalExpected - totalPaid).toFixed(2)}
- Students with Overdue Payments: ${overdueCount}

**🚨 OVERDUE PAYMENTS (Top 20):**
${overdueListStr || 'None'}
${overdueMore}

**Attendance:**
- Students with Low Attendance (<75%): ${lowAttendanceCount}

**⚠️ AT-RISK STUDENTS (Low Attendance):**
${lowAttendanceListStr || 'None'}
${lowAttendanceMore}

Use this specific data to answer the admin's questions. if they ask "Who has matched criteria?", use the lists above.
`;
  } catch (error) {
    console.error('Error getting database context:', error);
    return 'Database context unavailable at this moment.';
  }
};