// src/services/analytics/performanceReports.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ATTENDED_STATUSES = ['PRESENT', 'LATE'];
const safePercent = (num: number, den: number) =>
  den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0;

// 5. Group performance report
export const getGroupPerformanceReport = async (
  groupId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      level: true,
      teacher: true,
      term: { include: { program: true } },
      enrollments: {
        include: { student: true }
      }
    }
  });

  if (!group) throw new Error('Group not found');

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;

  const [attendanceRecords, criteria] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        enrollment: { groupId },
        ...(Object.keys(dateFilter).length
          ? { classSession: { sessionDate: dateFilter } }
          : {})
      },
      include: { student: true, classSession: true }
    }),
    prisma.progressCriteria.findMany({
      where: {
        isActive: true,
        OR: [{ groupId }, { levelId: group.levelId }]
      }
    })
  ]);

  const sessionsSet = new Set<string>();
  attendanceRecords.forEach((a) => sessionsSet.add(a.classSessionId));
  const totalClasses = sessionsSet.size;

  const totalCriteria = criteria.length;

  const studentBuckets: Record<
    string,
    { attended: number; totalRecords: number; completedCriteria: number }
  > = {};

  // Attendance aggregation
  for (const rec of attendanceRecords) {
    const sid = rec.studentId;
    if (!studentBuckets[sid]) {
      studentBuckets[sid] = {
        attended: 0,
        totalRecords: 0,
        completedCriteria: 0
      };
    }
    studentBuckets[sid].totalRecords += 1;
    if (ATTENDED_STATUSES.includes(rec.status)) {
      studentBuckets[sid].attended += 1;
    }
  }

  // Progress aggregation
  if (totalCriteria > 0) {
    const completions = await prisma.studentCriteriaCompletion.findMany({
      where: {
        criteriaId: { in: criteria.map((c) => c.id) }
      }
    });

    for (const c of completions) {
      const sid = c.studentId;
      if (!studentBuckets[sid]) {
        studentBuckets[sid] = {
          attended: 0,
          totalRecords: 0,
          completedCriteria: 0
        };
      }
      if (c.completed) {
        studentBuckets[sid].completedCriteria += 1;
      }
    }
  }

  const students = group.enrollments.map((enroll) => {
    const sid = enroll.studentId;
    const bucket = studentBuckets[sid] || {
      attended: 0,
      totalRecords: 0,
      completedCriteria: 0
    };

    const attendancePercentage = safePercent(bucket.attended, totalClasses);
    const progressPercentage = safePercent(
      bucket.completedCriteria,
      totalCriteria
    );

    let overallStatus = 'On Track';
    if (attendancePercentage < 75 || progressPercentage < 60) {
      overallStatus = 'At Risk';
    } else if (attendancePercentage < 85 || progressPercentage < 70) {
      overallStatus = 'Needs Support';
    }

    const student = enroll.student;

    return {
      studentId: sid,
      studentName: `${student.firstName} ${student.secondName || ''}`.trim(),
      email: student.email,
      attendancePercentage,
      progressPercentage,
      currentLevel: group.level?.name,
      criteriaCompleted: bucket.completedCriteria,
      totalCriteria,
      overallStatus
    };
  });

  return {
    groupId: group.id,
    groupName: group.name ?? group.groupCode,
    program: group.term?.program?.name ?? null,
    teacher:
      group.teacher &&
      `${group.teacher.firstName} ${group.teacher.lastName}`,
    period:
      startDate && endDate
        ? `${startDate.toISOString().slice(0, 10)} to ${endDate
            .toISOString()
            .slice(0, 10)}`
        : 'Full term',
    students
  };
};

// 6. Student performance report
export const getStudentPerformanceReport = async (
  studentId: string,
  enrollmentId?: string
) => {
  // 0) Make sure the student actually exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // 1) Resolve enrollment (either by id or latest ACTIVE for this student)
  let enrollment =
    enrollmentId
      ? await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            student: true,
            group: {
              include: {
                level: true,
                term: { include: { program: true } },
                teacher: true,
              },
            },
          },
        })
      : await prisma.enrollment.findFirst({
          where: { studentId, status: 'ACTIVE' },
          orderBy: { enrollmentDate: 'desc' },
          include: {
            student: true,
            group: {
              include: {
                level: true,
                term: { include: { program: true } },
                teacher: true,
              },
            },
          },
        });

  // If we were given an enrollmentId, make sure it belongs to THIS student
  if (!enrollment || enrollment.studentId !== studentId) {
    throw new Error('Enrollment not found for student');
  }

  const groupId = enrollment.groupId;

  // 2) Attendance
  const attendanceRecords = await prisma.attendance.findMany({
    where: { enrollmentId: enrollment.id },
    include: { classSession: true },
  });

  const sessionsSet = new Set<string>();
  let attendedCount = 0;

  for (const rec of attendanceRecords) {
    sessionsSet.add(rec.classSessionId);
    if (ATTENDED_STATUSES.includes(rec.status)) {
      attendedCount++;
    }
  }

  const totalClasses = sessionsSet.size;
  const attendancePercentage = safePercent(attendedCount, totalClasses);

  // 3) Progress criteria & completions
  const criteria = await prisma.progressCriteria.findMany({
    where: {
      isActive: true,
      OR: [{ groupId }, { levelId: enrollment.group.levelId }],
    },
  });

  const totalCriteria = criteria.length;

  const completions =
    totalCriteria > 0
      ? await prisma.studentCriteriaCompletion.findMany({
          where: {
            studentId,
            criteriaId: { in: criteria.map((c) => c.id) },
            enrollmentId: enrollment.id,
          },
        })
      : [];

  const completedCriteriaCount = completions.filter((c) => c.completed).length;
  const progressPercentage = safePercent(
    completedCriteriaCount,
    totalCriteria
  );

  // 4) Strengths / areas for improvement
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  if (progressPercentage >= 80) strengths.push('Overall performance');
  if (attendancePercentage >= 90) strengths.push('Attendance');
  if (progressPercentage < 70) areasForImprovement.push('Course progress');
  if (attendancePercentage < 80) areasForImprovement.push('Attendance');

  const attendanceStatus =
    attendancePercentage >= 85
      ? 'On Track'
      : attendancePercentage >= 70
      ? 'Needs Support'
      : 'At Risk';

  const overallPerformance =
    progressPercentage >= 85
      ? 'Excellent'
      : progressPercentage >= 70
      ? 'Good'
      : 'Needs Improvement';

  // 5) Final report object
  return {
    studentId: enrollment.studentId,
    studentName: `${enrollment.student.firstName} ${
      enrollment.student.secondName || ''
    }`.trim(),
    studentEmail: enrollment.student.email,

    enrollmentId: enrollment.id,
    groupName: enrollment.group.name ?? enrollment.group.groupCode,
    program: enrollment.group.term.program.name,
    teacher: `${enrollment.group.teacher?.firstName ?? ''} ${
      enrollment.group.teacher?.lastName ?? ''
    }`.trim(),
    term: enrollment.group.term.name,

    attendancePercentage,
    attendanceStatus,
    totalClasses,
    classesAttended: attendedCount,

    progressPercentage,
    criteriaCompleted: criteria.map((c) => ({
      criteriaId: c.id,
      criteriaName: c.name,
      completed: completions.some(
        (sc) => sc.criteriaId === c.id && sc.completed
      ),
      completedDate:
        completions.find(
          (sc) => sc.criteriaId === c.id && sc.completed
        )?.completedAt ?? null,
    })),

    currentLevel: enrollment.group.level?.name || null,
    teacherComments: '',
    overallPerformance,
    strengths,
    areasForImprovement,
  };
};
// 10. At-risk students
export const getAtRiskStudents = async (groupId?: string, threshold = 75) => {
  const enrollments = await prisma.enrollment.findMany({
    where: groupId ? { groupId } : {},
    include: {
      student: true,
      group: { include: { level: true } }
    }
  });

  if (enrollments.length === 0) {
    return { atRiskStudents: [], total: 0 };
  }

  const enrollmentIds = enrollments.map((e) => e.id);

  const attendanceRecords = await prisma.attendance.findMany({
    where: { enrollmentId: { in: enrollmentIds } }
  });

  const attendanceMap: any = {};
  const sessionsByEnrollment: Record<string, Set<string>> = {};

  attendanceRecords.forEach((a) => {
    const eid = a.enrollmentId;
    if (!attendanceMap[eid]) attendanceMap[eid] = { attended: 0, total: 0 };
    if (!sessionsByEnrollment[eid]) sessionsByEnrollment[eid] = new Set();
    sessionsByEnrollment[eid].add(a.classSessionId);
    attendanceMap[eid].total += 1;
    if (ATTENDED_STATUSES.includes(a.status)) {
      attendanceMap[eid].attended += 1;
    }
  });
  const criteria = await prisma.progressCriteria.findMany({
    where: {
      isActive: true,
      OR: [
        ...(groupId ? [{ groupId }] : []),
        { levelId: { in: enrollments.map((e) => e.group.levelId) } }
      ]
    }
  });

  const criteriaIds = criteria.map((c) => c.id);

  const completions =
    criteriaIds.length > 0
      ? await prisma.studentCriteriaCompletion.findMany({
          where: {
            criteriaId: { in: criteriaIds },
            enrollmentId: { in: enrollmentIds }
          }
        })
      : [];

  const progressMap: any = {};
  completions.forEach((c) => {
    const eid = c.enrollmentId!;
    if (!progressMap[eid]) progressMap[eid] = { completed: 0, total: 0 };
    progressMap[eid].total += 1;
    if (c.completed) progressMap[eid].completed += 1;
  });

  const totalCriteriaPerEnrollment = (eid: string) =>
    progressMap[eid]?.total || criteria.length;

  const atRisk: any[] = [];

  for (const e of enrollments) {
    const aInfo = attendanceMap[e.id] || { attended: 0, total: 0 };
    const totalSessions =
      sessionsByEnrollment[e.id]?.size ?? aInfo.total ?? 0;
    const attendancePercentage = safePercent(aInfo.attended, totalSessions);

    const pInfo = progressMap[e.id] || { completed: 0, total: 0 };
    const totalCrit = totalCriteriaPerEnrollment(e.id);
    const progressPercentage = safePercent(pInfo.completed, totalCrit);

    if (attendancePercentage < threshold || progressPercentage < threshold) {
      const riskLevel =
        attendancePercentage < threshold - 10 ||
        progressPercentage < threshold - 10
          ? 'High'
          : 'Medium';

      const reasons: string[] = [];
      if (attendancePercentage < threshold) reasons.push('Low attendance');
      if (progressPercentage < threshold) reasons.push('Behind on progress');

      atRisk.push({
        studentId: e.studentId,
        studentName: `${e.student.firstName} ${
          e.student.secondName || ''
        }`.trim(),
        groupName: e.group.name ?? e.group.groupCode,
        attendancePercentage,
        progressPercentage,
        riskLevel,
        reasons,
        recommendation: 'Schedule parent meeting'
      });
    }
  }

  return {
    atRiskStudents: atRisk,
    total: atRisk.length
  };
};