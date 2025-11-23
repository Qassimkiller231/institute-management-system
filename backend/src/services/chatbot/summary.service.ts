import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate admin weekly summary (ADMIN ONLY)
 */
export const getAdminWeeklySummary = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // New enrollments
  const newEnrollments = await prisma.enrollment.count({
    where: { createdAt: { gte: oneWeekAgo } }
  });
  
  // Payments collected
  const paymentsThisWeek = await prisma.installment.findMany({
    where: { paymentDate: { gte: oneWeekAgo } }
  });
  
  const totalCollected = paymentsThisWeek.reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Attendance stats
  const attendanceRecords = await prisma.attendance.findMany({
    where: { createdAt: { gte: oneWeekAgo } }
  });
  
  const presentCount = attendanceRecords.filter(a => 
    a.status === 'PRESENT' || a.status === 'LATE'
  ).length;
  
  const avgAttendance = attendanceRecords.length > 0 
    ? parseFloat(((presentCount / attendanceRecords.length) * 100).toFixed(1))
    : 0;
  
  // Active students
  const activeStudents = await prisma.student.count({
    where: { isActive: true }
  });
  
  const summary = `📊 **Admin Weekly Summary**

**Week of ${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}**

📚 **Enrollments:**
- New Enrollments: ${newEnrollments}
- Total Active Students: ${activeStudents}

💰 **Revenue:**
- Payments Received: ${paymentsThisWeek.length}
- Total Collected: BHD ${totalCollected.toFixed(2)}

📊 **Attendance:**
- Total Records: ${attendanceRecords.length}
- Average Attendance: ${avgAttendance}%

${avgAttendance < 75 ? '⚠️ **Alert:** Average attendance below target (75%)' : ''}
${totalCollected === 0 ? '⚠️ **Alert:** No payments received this week' : ''}`;

  return summary;
};