// backend/src/services/report.service.ts
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import prisma from "../utils/db";

const ATTENDED_STATUSES = ['PRESENT', 'LATE'];

// ============================================
// PLACEMENT TEST REPORTS (Individual Student)
// ============================================

interface ReportData {
  student: {
    id: string;
    firstName: string;
    secondName: string | null;
    thirdName: string | null;
    email: string | null;
    dateOfBirth: Date;
    currentLevel: string | null;
  };
  testSession: {
    id: string;
    startedAt: Date;
    completedAt: Date | null;
    score?: number;
    test: {
      name: string;
      totalQuestions: number;
    };
  };
  speakingSlot?: {
    mcqLevel: string | null;
    speakingLevel: string | null;
    finalLevel: string | null;
    feedback: string | null;
    teacher: {
      firstName: string;
      lastName: string;
    };
  } | undefined;
}

export const getReportData = async (studentId: string): Promise<ReportData> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: { email: true },
      },
      testSessions: {
        where: {
          status: "COMPLETED",
          test: { testType: "PLACEMENT" },
        },
        include: {
          test: {
            select: {
              name: true,
              totalQuestions: true,
            },
          },
          speakingSlots: {
            where: { status: "COMPLETED" },
            include: {
              teacher: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (!student.testSessions || student.testSessions.length === 0) {
    throw new Error("No completed test sessions found for this student");
  }

  const testSession = student.testSessions[0];
  const speakingSlot = testSession.speakingSlots?.[0];

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      secondName: student.secondName,
      thirdName: student.thirdName,
      email: student.user.email,
      dateOfBirth: student.dateOfBirth,
      currentLevel: student.currentLevel,
    },
    testSession: {
      id: testSession.id,
      startedAt: testSession.startedAt,
      completedAt: testSession.completedAt,
      score: testSession.score ? Number(testSession.score) : undefined,
      test: testSession.test,
    },
    speakingSlot: speakingSlot
      ? {
          mcqLevel: speakingSlot.mcqLevel,
          speakingLevel: speakingSlot.speakingLevel,
          finalLevel: speakingSlot.finalLevel,
          feedback: speakingSlot.feedback,
          teacher: speakingSlot.teacher,
        }
      : undefined,
  };
};

export const generatePlacementTestReport = async (
  studentId: string
): Promise<PassThrough> => {
  const data = await getReportData(studentId);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  // Header
  doc
    .fontSize(24)
    .fillColor("#1e40af")
    .text("Function Institute", { align: "center" })
    .fontSize(18)
    .fillColor("#000000")
    .text("Placement Test Report", { align: "center" })
    .moveDown(2);

  // Student Information
  doc
    .fontSize(14)
    .fillColor("#1e40af")
    .text("Student Information", { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(11)
    .fillColor("#000000")
    .text(
      `Name: ${data.student.firstName} ${data.student.secondName || ""} ${
        data.student.thirdName || ""
      }`.trim()
    )
    .text(`Email: ${data.student.email || "N/A"}`)
    .text(
      `Date of Birth: ${data.student.dateOfBirth.toLocaleDateString("en-US")}`
    )
    .text(
      `Test Date: ${
        data.testSession.completedAt?.toLocaleDateString("en-US") ||
        "In Progress"
      }`
    )
    .moveDown(1.5);

  // Test Results
  doc
    .fontSize(14)
    .fillColor("#1e40af")
    .text("Test Results", { underline: true })
    .moveDown(0.5);

  // MCQ Test Results
  doc
    .fontSize(12)
    .fillColor("#000000")
    .text("Multiple Choice Test:", { underline: true })
    .moveDown(0.3);

  const mcqScore = data.testSession.score || 0;
  const totalQuestions = data.testSession.test.totalQuestions;
  const percentage = ((mcqScore / totalQuestions) * 100).toFixed(1);

  doc
    .fontSize(11)
    .text(`Score: ${mcqScore} / ${totalQuestions} (${percentage}%)`)
    .text(`MCQ Level: ${data.speakingSlot?.mcqLevel || "Pending"}`)
    .moveDown(1);

  // Speaking Test Results
  if (data.speakingSlot) {
    doc.fontSize(12).text("Speaking Test:", { underline: true }).moveDown(0.3);

    doc
      .fontSize(11)
      .text(
        `Evaluated by: ${data.speakingSlot.teacher.firstName} ${data.speakingSlot.teacher.lastName}`
      )
      .text(`Speaking Level: ${data.speakingSlot.speakingLevel}`)
      .moveDown(1);

    if (data.speakingSlot.feedback) {
      doc
        .fontSize(12)
        .text("Teacher Feedback:", { underline: true })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .text(data.speakingSlot.feedback, {
          width: 500,
          align: "justify",
        })
        .moveDown(1);
    }
  }

  // Final Level
  doc
    .fontSize(14)
    .fillColor("#1e40af")
    .text("Final Assessment", { underline: true })
    .moveDown(0.5);

  const finalLevel =
    data.student.currentLevel || data.speakingSlot?.finalLevel || "Pending";

  doc
    .fontSize(20)
    .fillColor("#059669")
    .text(`Level: ${finalLevel}`, { align: "center" })
    .moveDown(0.5);

  // Level Description
  const levelDescriptions: Record<string, string> = {
    A1: "Beginner - Can understand and use familiar everyday expressions and very basic phrases.",
    A2: "Elementary - Can communicate in simple and routine tasks requiring direct exchange of information.",
    B1: "Intermediate - Can deal with most situations likely to arise while traveling in an English-speaking area.",
    B2: "Upper Intermediate - Can interact with a degree of fluency and spontaneity with native speakers.",
    C1: "Advanced - Can express ideas fluently and spontaneously without much obvious searching for expressions.",
    C2: "Proficient - Can understand with ease virtually everything heard or read and express themselves spontaneously, very fluently and precisely.",
  };

  if (finalLevel && finalLevel !== "Pending") {
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(levelDescriptions[finalLevel] || "", {
        align: "center",
        width: 500,
      })
      .moveDown(2);
  }

  // Recommendations
  doc
    .fontSize(14)
    .fillColor("#1e40af")
    .text("Recommendations", { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(11)
    .fillColor("#000000")
    .text(
      `Based on your assessment, we recommend enrolling in our ${finalLevel} level program.`,
      {
        width: 500,
        align: "justify",
      }
    )
    .text(
      "Our courses are designed to help you progress to the next level through engaging lessons and practical exercises.",
      {
        width: 500,
        align: "justify",
      }
    )
    .moveDown(2);

  // Footer
  doc
    .fontSize(9)
    .fillColor("#6b7280")
    .text("This report is valid for 6 months from the test date.", {
      align: "center",
    })
    .text("Function Institute - Excellence in English Education", {
      align: "center",
    })
    .text(`Generated on: ${new Date().toLocaleDateString("en-US")}`, {
      align: "center",
    });

  doc.end();
  return stream;
};

export const getLevelDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    A1: "Beginner - Can understand and use familiar everyday expressions",
    A2: "Elementary - Can communicate in simple and routine tasks",
    B1: "Intermediate - Can deal with most situations while traveling",
    B2: "Upper Intermediate - Can interact with a degree of fluency",
    C1: "Advanced - Can express ideas fluently and spontaneously",
    C2: "Proficient - Can understand virtually everything with ease",
  };

  return descriptions[level] || "Level description not available";
};

// ============================================
// GROUP REPORTS (Teacher Portal)
// ============================================

export const generateAttendanceReportPDF = async (groupId: string): Promise<Buffer> => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      level: true,
      teacher: { select: { firstName: true, lastName: true } },
      term: { include: { program: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: true,
          attendance: { orderBy: { markedAt: 'asc' } }
        }
      }
    }
  });

  if (!group) throw new Error('Group not found');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Attendance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Group: ${group.groupCode} ${group.name || ''}`)
      .text(`Level: ${group.level.name}`)
      .text(`Teacher: ${group.teacher?.firstName || 'N/A'} ${group.teacher?.lastName || ''}`)
      .text(`Program: ${group.term.program.name}`)
      .text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Student attendance data
    group.enrollments.forEach((enrollment, idx) => {
      const student = enrollment.student;
      const attendances = enrollment.attendance;
      const totalSessions = attendances.length;
      const attended = attendances.filter((a: any) => ATTENDED_STATUSES.includes(a.status)).length;
      const percentage = totalSessions > 0 ? ((attended / totalSessions) * 100).toFixed(1) : '0';

      doc.fontSize(10)
        .text(`${idx + 1}. ${student.firstName} ${student.secondName || ''} ${student.thirdName || ''}`)
        .text(`   Sessions: ${attended}/${totalSessions} (${percentage}%)`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.end();
  });
};

export const generateProgressReportPDF = async (groupId: string): Promise<Buffer> => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      level: true,
      teacher: { select: { firstName: true, lastName: true } },
      term: { include: { program: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: true,
          progressCompletions: {
            include: { criteria: true }
          }
        }
      }
    }
  });

  if (!group) throw new Error('Group not found');

  const allCriteria = await prisma.progressCriteria.findMany({
    where: { levelId: group.levelId }
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Progress Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Group: ${group.groupCode} ${group.name || ''}`)
      .text(`Level: ${group.level.name}`)
      .text(`Teacher: ${group.teacher?.firstName || 'N/A'} ${group.teacher?.lastName || ''}`)
      .text(`Program: ${group.term.program.name}`)
      .text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Student progress data
    group.enrollments.forEach((enrollment, idx) => {
      const student = enrollment.student;
      const completed = enrollment.progressCompletions.filter((p: any) => p.completed === true).length;
      const total = allCriteria.length;
      const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

      doc.fontSize(10)
        .text(`${idx + 1}. ${student.firstName} ${student.secondName || ''} ${student.thirdName || ''}`)
        .text(`   Progress: ${completed}/${total} criteria (${percentage}%)`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.end();
  });
};

export const generatePerformanceReportPDF = async (groupId: string): Promise<Buffer> => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      level: true,
      teacher: { select: { firstName: true, lastName: true } },
      term: { include: { program: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: true,
          attendance: true,
          progressCompletions: true
        }
      }
    }
  });

  if (!group) throw new Error('Group not found');

  const allCriteria = await prisma.progressCriteria.findMany({
    where: { levelId: group.levelId }
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Performance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Group: ${group.groupCode} ${group.name || ''}`)
      .text(`Level: ${group.level.name}`)
      .text(`Teacher: ${group.teacher?.firstName || 'N/A'} ${group.teacher?.lastName || ''}`)
      .text(`Program: ${group.term.program.name}`)
      .text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Combined performance data
    group.enrollments.forEach((enrollment, idx) => {
      const student = enrollment.student;
      
      // Attendance
      const totalSessions = enrollment.attendance.length;
      const attended = enrollment.attendance.filter((a: any) => ATTENDED_STATUSES.includes(a.status)).length;
      const attendancePercentage = totalSessions > 0 ? ((attended / totalSessions) * 100).toFixed(1) : '0';

      // Progress
      const completed = enrollment.progressCompletions.filter((p: any) => p.completed === true).length;
      const total = allCriteria.length;
      const progressPercentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

      // Overall performance
      const overall = totalSessions > 0 && total > 0 
        ? (((Number(attendancePercentage) + Number(progressPercentage)) / 2).toFixed(1))
        : '0';

      doc.fontSize(10)
        .text(`${idx + 1}. ${student.firstName} ${student.secondName || ''} ${student.thirdName || ''}`)
        .text(`   Attendance: ${attendancePercentage}%`, { indent: 20 })
        .text(`   Progress: ${progressPercentage}%`, { indent: 20 })
        .text(`   Overall: ${overall}%`, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.end();
  });
};