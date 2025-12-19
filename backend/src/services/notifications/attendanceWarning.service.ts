import { PrismaClient } from '@prisma/client';
import * as emailService from '../email.service';
import * as smsService from '../sms.service';

const prisma = new PrismaClient();

const ATTENDANCE_THRESHOLD = 75;

export const checkAndSendWarnings = async () => {
  console.log('\n⚠️  ===== ATTENDANCE WARNING CHECK START =====');
  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      student: {
        include: {
          user: true,
          parentStudentLinks: {
            include: {
              parent: { include: { user: true } },
            },
          },
        },
      },
      group: { include: { level: true } },
      attendance: { include: { classSession: true } },
    },
  });

  console.log(`📊 Found ${enrollments.length} active enrollments`);

  let sentCount = 0;
  const TEST_LIMIT = 1; // **TESTING: Only send 1 warning**

  for (const enrollment of enrollments) {
    if (sentCount >= TEST_LIMIT) {
      console.log(`⚠️  TEST MODE: Reached limit of ${TEST_LIMIT} warning(s), stopping.`);
      break;
    }

    const totalClasses = enrollment.attendance.length;
    if (totalClasses === 0) continue;

    const attendedClasses = enrollment.attendance.filter(
      (att) => att.status === 'PRESENT' || att.status === 'LATE'
    ).length;

    const attendancePercentage = (attendedClasses / totalClasses) * 100;

    if (attendancePercentage < ATTENDANCE_THRESHOLD) {
      console.log(`\n📉 Student ${enrollment.student.firstName}: ${attendancePercentage.toFixed(1)}% attendance (below ${ATTENDANCE_THRESHOLD}%)`);
      await sendWarning(enrollment, attendancePercentage, attendedClasses, totalClasses);
      sentCount++;
    }
  }
  console.log(`\n✅ Sent ${sentCount} attendance warning(s)`);
  console.log('⚠️  ===== ATTENDANCE WARNING CHECK END =====\n');
};

async function sendWarning(
  enrollment: any,
  attendancePercentage: number,
  classesAttended: number,
  totalClasses: number
) {
  const student = enrollment.student;
  const studentEmail = student.user.email;
  const studentPhone = student.user.phone;

  // ⚠️ TEMPORARILY DISABLED FOR TESTING - REMOVE AFTER TESTING
  /*
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const existingWarning = await prisma.notification.findFirst({
    where: {
      userId: student.userId,
      type: 'ATTENDANCE_WARNING',
      createdAt: { gte: oneWeekAgo },
    },
  });

  if (existingWarning) {
    console.log(`Warning already sent for student ${student.id}`);
    return;
  }
  */
  console.log(`   🚀 SENDING WARNING (deduplication disabled for testing)`);


  const groupName = enrollment.group?.name || 'Unknown Group';

  // Send email to student
  if (studentEmail) {
    try {
      await emailService.sendAttendanceWarningEmail({
        to: studentEmail,
        studentName: `${student.firstName} ${student.secondName || ''}`.trim(),
        attendancePercentage: Number(attendancePercentage),
        classesAttended,
        totalClasses,
        groupName,
        recipientType: 'STUDENT',
      });

      await logWarning(student.userId, 'EMAIL');
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  // Send SMS to student
  if (studentPhone) {
    try {
      const smsMessage = `WARNING: Attendance ${attendancePercentage.toFixed(
        1
      )}% (min 75%). Attended ${classesAttended}/${totalClasses} classes. Improve immediately. -Function Institute`;

      await smsService.sendSMS({
        to: studentPhone,
        message: smsMessage,
      });

      await logWarning(student.userId, 'SMS');
    } catch (error) {
      console.error('SMS send error:', error);
    }
  }

  // Send to parents
  for (const link of student.parentStudentLinks || []) {
    const parentEmail = link.parent.user.email;
    const parentPhone = link.parent.user.phone;

    if (parentEmail) {
      try {
        await emailService.sendAttendanceWarningEmail({
          to: parentEmail,
          studentName: `${student.firstName} ${student.secondName || ''}`.trim(),
          attendancePercentage: Number(attendancePercentage),
          classesAttended,
          totalClasses,
          groupName,
          recipientType: 'PARENT',
        });
      } catch (error) {
        console.error('Parent email send error:', error);
      }
    }

    if (parentPhone) {
      try {
        const smsMessage = `WARNING: ${student.firstName}'s attendance ${attendancePercentage.toFixed(
          1
        )}% (min 75%). ${classesAttended}/${totalClasses} classes. Contact office urgently. -Function Institute`;

        await smsService.sendSMS({
          to: parentPhone,
          message: smsMessage,
        });
      } catch (error) {
        console.error('Parent SMS send error:', error);
      }
    }
  }
}

async function logWarning(userId: string, sentVia: string) {
  await prisma.notification.create({
    data: {
      userId,
      type: 'ATTENDANCE_WARNING',
      title: 'Attendance Warning',
      message: 'Your attendance is below the required 75% threshold.',
      sentVia,
      sentAt: new Date(),
    },
  });
}

export const sendManualWarning = async (studentId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'ACTIVE',
    },
    include: {
      student: {
        include: {
          user: true,
          parentStudentLinks: {
            include: {
              parent: { include: { user: true } },
            },
          },
        },
      },
      group: { include: { level: true } },
      attendance: true,
    },
  });

  if (enrollments.length === 0) {
    throw new Error('Student not found');
  }

  for (const enrollment of enrollments) {
    const totalClasses = enrollment.attendance.length;
    if (totalClasses === 0) continue;

    const attendedClasses = enrollment.attendance.filter(
      (att) => att.status === 'PRESENT' || att.status === 'LATE'
    ).length;

    const attendancePercentage = (attendedClasses / totalClasses) * 100;

    await sendWarning(enrollment, attendancePercentage, attendedClasses, totalClasses);
  }
};

export const getStudentsAtRisk = async () => {
  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      student: { include: { user: true } },
      group: { include: { level: true } },
      attendance: true,
    },
  });

  const atRisk = [];

  for (const enrollment of enrollments) {
    const totalClasses = enrollment.attendance.length;
    if (totalClasses === 0) continue;

    const attendedClasses = enrollment.attendance.filter(
      (att) => att.status === 'PRESENT' || att.status === 'LATE'
    ).length;

    const attendancePercentage = (attendedClasses / totalClasses) * 100;

    if (attendancePercentage < ATTENDANCE_THRESHOLD) {
      atRisk.push({
        studentId: enrollment.student.id,
        studentName: `${enrollment.student.firstName} ${enrollment.student.secondName || ''}`.trim(),
        email: enrollment.student.user.email,
        phone: enrollment.student.user.phone,
        attendancePercentage: Number(attendancePercentage.toFixed(1)),
        classesAttended: attendedClasses,
        totalClasses,
        level: enrollment.group?.level?.name || 'N/A',
        groupName: enrollment.group?.name || 'Unknown',
      });
    }
  }

  return atRisk;
};