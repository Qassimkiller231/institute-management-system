// src/services/analytics/dashboardAnalytics.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ATTENDED_STATUSES = ['PRESENT', 'LATE'];
const safePercent = (num: number, den: number) =>
  den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0;

// 7. Admin dashboard
export const getAdminDashboard = async (termId?: string) => {
  const [studentsCount, teachersCount, groups, enrollments, installments, testSessions, attendanceRecords] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.group.findMany({
        where: termId ? { termId } : {}
      }),
      prisma.enrollment.findMany({
        where: termId ? { group: { termId } } : {}
      }),
      prisma.installment.findMany({
        where: termId
          ? { paymentPlan: { enrollment: { group: { termId } } } }
          : {}
      }),
      prisma.testSession.findMany(),
      prisma.attendance.findMany()
    ]);

  const activeGroups = groups.filter((g) => g.isActive).length;
  const activeEnrollments = enrollments.filter(
    (e) => e.status === 'ACTIVE'
  ).length;

  // Calculate total revenue
  let totalRevenue = 0;
  installments.forEach((inst) => {
    totalRevenue += Number(inst.amount);
  });

 const enrollmentStats = {
  pendingTests: testSessions.filter(t => 
    t.status === 'IN_PROGRESS'  // ← Show tests currently being taken
  ).length,
  testCompleted: testSessions.filter(t => 
    t.status === 'SPEAKING_COMPLETED' ||  // ← Only fully completed tests
    t.status === 'COMPLETED'
  ).length,
  awaitingSpeaking: testSessions.filter(t => 
    t.status === 'SPEAKING_SCHEDULED'
  ).length,
  enrolled: activeEnrollments,
  withdrew: enrollments.filter((e) => e.status === 'WITHDRAWN').length
};

  // Calculate attendance overview
  const studentAttendance: Record<string, { attended: number; total: number }> = {};
  
  attendanceRecords.forEach(record => {
    if (!studentAttendance[record.studentId]) {
      studentAttendance[record.studentId] = { attended: 0, total: 0 };
    }
    studentAttendance[record.studentId].total++;
    if (ATTENDED_STATUSES.includes(record.status)) {
      studentAttendance[record.studentId].attended++;
    }
  });

  const attendancePercentages = Object.values(studentAttendance).map(s => 
    safePercent(s.attended, s.total)
  );

  const averageAttendance = attendancePercentages.length > 0
    ? attendancePercentages.reduce((sum, p) => sum + p, 0) / attendancePercentages.length
    : 0;

  const atRiskStudents = attendancePercentages.filter(p => p < 75).length;
  const excellentAttendance = attendancePercentages.filter(p => p >= 90).length;

  const attendanceOverview = {
    averageAttendance: Number(averageAttendance.toFixed(2)),
    atRiskStudents,
    excellentAttendance
  };

  // Calculate financial summary
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let collectedThisMonth = 0;
  let totalPaid = 0;

  installments.forEach(inst => {
    const amount = Number(inst.amount);
    
    // Total paid (all time)
    totalPaid += amount;
    
    // Collected this month (payment_date in current month)
    if (inst.paymentDate &&inst.paymentDate >= firstDayOfMonth && 
        inst.paymentDate <= lastDayOfMonth) {
      collectedThisMonth += amount;
    }
  });

  // Get total expected from payment plans
  const paymentPlans = await prisma.studentPaymentPlan.findMany({
    where: termId 
      ? { enrollment: { group: { termId } } }
      : {}
  });

  let totalExpected = 0;
  paymentPlans.forEach(plan => {
    totalExpected += Number(plan.finalAmount);
  });

  const overdueAmount = totalExpected - totalPaid;
  const collectionRate = safePercent(totalPaid, totalExpected);

  const financialSummary = {
    collectedThisMonth: Number(collectedThisMonth.toFixed(2)),
    expectedThisMonth: 0, // You don't have due dates, so can't calculate
    collectionRate,
    overdueAmount: Number(Math.max(0, overdueAmount).toFixed(2))
  };

  // Recent activity
  const recentActivity = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: true
    }
  });

  const formattedActivity = recentActivity.map(log => ({
    action: log.action,
    description: `${log.user?.email || 'System'} ${log.action.toLowerCase()} ${log.tableName || 'record'}`,
    timestamp: log.createdAt,
    userId: log.userId
  }));

  // Pending payments = payment plans where totalPaid < finalAmount
  const pendingPayments = paymentPlans.filter(plan => {
    const planInstallments = installments.filter(i => i.paymentPlanId === plan.id);
    const paidAmount = planInstallments.reduce((sum, i) => sum + Number(i.amount), 0);
    return paidAmount < Number(plan.finalAmount);
  }).length;

  return {
    overview: {
      totalStudents: studentsCount,
      activeEnrollments,
      totalTeachers: teachersCount,
      activeGroups,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingPayments
    },
    enrollmentStats,
    attendanceOverview,
    financialSummary,
    recentActivity: formattedActivity
  };
};

// 8. Teacher dashboard
export const getTeacherDashboard = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId }
  });
  if (!teacher) throw new Error('Teacher not found');

  const groups = await prisma.group.findMany({
    where: { teacherId },
    include: {
      enrollments: true,
      venue: true,
      classSessions: true
    }
  });

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const assignedGroups = groups.map((g) => {
    const totalStudents = g.enrollments.length;
    const averageAttendance = 0;
    const upcomingClasses = g.classSessions.filter(
      (s) => s.sessionDate >= today
    ).length;

    return {
      groupId: g.id,
      groupName: g.name ?? g.groupCode,
      totalStudents,
      averageAttendance,
      upcomingClasses
    };
  });

  const todaySchedule = groups
    .flatMap((g) =>
      g.classSessions.map((s) => ({
        groupName: g.name ?? g.groupCode,
        startTime: s.startTime.toISOString().slice(11, 16),
        endTime: s.endTime.toISOString().slice(11, 16),
        date: s.sessionDate.toISOString().slice(0, 10),
        venue: g.venue?.name ?? null,
        hall: null as string | null
      }))
    )
    .filter((c) => c.date === todayStr);

  const pendingTasks = {
    attendanceToMark: 0,
    progressToUpdate: 0,
    speakingTestsScheduled: 0
  };

  return {
    teacherId,
    teacherName: `${teacher.firstName} ${teacher.lastName}`,
    assignedGroups,
    todaySchedule,
    pendingTasks
  };
};

// 9. Trends
export const getTrends = async (monthsBack = 6) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - monthsBack);

  const [enrollments, attendance, installments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { createdAt: { gte: start, lte: end } }
    }),
    prisma.attendance.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { classSession: true }
    }),
    prisma.installment.findMany({
      where: { paymentDate: { gte: start, lte: end } }
    })
  ]);

  const enrollmentBuckets: any = {};
  const attendanceBuckets: any = {};
  const revenueBuckets: any = {};

  const monthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  enrollments.forEach((e) => {
    const key = monthKey(e.createdAt);
    if (!enrollmentBuckets[key]) {
      enrollmentBuckets[key] = { enrolled: 0, withdrew: 0 };
    }
    if (e.status === 'WITHDRAWN') {
      enrollmentBuckets[key].withdrew++;
    } else {
      enrollmentBuckets[key].enrolled++;
    }
  });

  const attendanceCounts: any = {};
  attendance.forEach((a) => {
    const key = monthKey(a.createdAt);
    if (!attendanceCounts[key]) {
      attendanceCounts[key] = { present: 0, total: 0 };
    }
    attendanceCounts[key].total++;
    if (ATTENDED_STATUSES.includes(a.status)) {
      attendanceCounts[key].present++;
    }
  });

  Object.keys(attendanceCounts).forEach((key) => {
    const bucket = attendanceCounts[key];
    attendanceBuckets[key] = {
      averageAttendance: safePercent(bucket.present, bucket.total)
    };
  });

  installments.forEach((inst) => {
    if (!inst.paymentDate) return;
    const key = monthKey(inst.paymentDate);
    if (!revenueBuckets[key]) {
      revenueBuckets[key] = { collected: 0, expected: 0 };
    }
    revenueBuckets[key].collected += Number(inst.amount);
  });

  return {
    enrollmentTrend: Object.entries(enrollmentBuckets).map(
      ([month, v]: any) => ({
        month,
        enrolled: v.enrolled,
        withdrew: v.withdrew,
        net: v.enrolled - v.withdrew
      })
    ),
    attendanceTrend: Object.entries(attendanceBuckets).map(
      ([month, v]: any) => ({
        month,
        averageAttendance: v.averageAttendance
      })
    ),
    revenueTrend: Object.entries(revenueBuckets).map(
      ([month, v]: any) => ({
        month,
        collected: v.collected,
        expected: v.expected
      })
    )
  };
};