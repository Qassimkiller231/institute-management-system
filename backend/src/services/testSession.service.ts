// src/services/testSession.service.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type TestSessionStatus =
  | 'IN_PROGRESS'
  | 'MCQ_COMPLETED'
  | 'SPEAKING_SCHEDULED'
  | 'SPEAKING_COMPLETED'
  | 'FINAL_RESULTS'
  | 'COMPLETED'
  | 'ABANDONED';

interface StartTestSessionInput {
  studentId: string;
  testId: string;
}

interface SubmitMcqInput {
  sessionId: string;
  answers: Record<string, string>;
}

interface FinalizeSessionInput {
  sessionId: string;
  finalLevelId?: string;
  recommendation?: string;
  passed?: boolean;
}

export const startTestSession = async (data: StartTestSessionInput) => {
  const [student, test] = await Promise.all([
    prisma.student.findUnique({ where: { id: data.studentId } }),
    prisma.test.findUnique({ where: { id: data.testId } })
  ]);

  if (!student) throw new Error('Student not found');
  if (!test || !test.isActive) throw new Error('Test not found or inactive');

  // Check if student already has an active placement test session
  const activeSession = await prisma.testSession.findFirst({
    where: {
      studentId: data.studentId,
      status: {
        in: ['IN_PROGRESS', 'MCQ_COMPLETED']
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // If active session exists, throw error
  if (activeSession) {
    throw new Error('You already have an active placement test. Please complete it first.');
  }

  // ✨ NEW: Check if student has ALREADY COMPLETED this specific test
  const existingCompletedSession = await prisma.testSession.findFirst({
    where: {
      studentId: data.studentId,
      testId: data.testId,
      status: {
        in: ['COMPLETED', 'FINAL_RESULTS', 'MCQ_COMPLETED', 'SPEAKING_COMPLETED']
      }
    }
  });

  if (existingCompletedSession) {
    throw new Error('You have already taken this test. You cannot retake the same test.');
  }

  // Create new session
  const session = await prisma.testSession.create({
    data: {
      studentId: data.studentId,
      testId: data.testId,
      startedAt: new Date(),
      status: 'IN_PROGRESS'
    }
  });

  return {
    id: session.id,
    testId: session.testId,
    status: session.status,
    startedAt: session.startedAt,
    durationMinutes: test.durationMinutes
  };
};


// Get questions for a session (without correct answers)
export const getSessionQuestions = async (sessionId: string) => {
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      test: {
        include: {
          questions: {
            orderBy: { orderNumber: 'asc' }
          }
        }
      },
      student: true
    }
  });

  if (!session) throw new Error('Test session not found');

  const { test } = session;

  return {
    sessionId: session.id,
    test: {
      id: test.id,
      name: test.name,
      testType: test.testType,
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions,
      questions: test.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        orderNumber: q.orderNumber
        // NOTE: correctAnswer intentionally NOT returned
      }))
    }
  };
};

// Submit MCQ answers and calculate score
export const submitMcqAnswers = async (input: SubmitMcqInput) => {
  const session = await prisma.testSession.findUnique({
    where: { id: input.sessionId },
    include: {
      test: {
        include: { questions: true }
      }
    }
  });

  if (!session) throw new Error('Test session not found');
  if (session.status !== 'IN_PROGRESS') {
    throw new Error('MCQ part already submitted or session not in progress');
  }

  const questions = session.test.questions;

  let totalPoints = 0;
  let earnedPoints = 0;

  const answerDetails: Record<
    string,
    { given: string | null; correct: string; points: number; earned: number }
  > = {};

  for (const q of questions) {
    totalPoints += q.points;
    const given = input.answers[q.id] ?? null;
    const isCorrect =
      given !== null && String(given).trim() === String(q.correctAnswer).trim();
    const earned = isCorrect ? q.points : 0;
    earnedPoints += earned;

    answerDetails[q.id] = {
      given,
      correct: q.correctAnswer,
      points: q.points,
      earned
    };
  }

  const scorePercent =
    totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  const jsonPayload: Prisma.InputJsonValue = {
    // keep all answer details in JSON field
    type: 'MCQ',
    submittedAt: new Date().toISOString(),
    totalPoints,
    earnedPoints,
    scorePercent,
    answers: answerDetails
  };

  const updated = await prisma.testSession.update({
    where: { id: input.sessionId },
    data: {
      score: new Prisma.Decimal(scorePercent.toFixed(2)),
      answers: jsonPayload,
      completedAt: new Date(),
      status: 'MCQ_COMPLETED'
    }
  });

  return {
    sessionId: updated.id,
    scorePercent,
    totalPoints,
    earnedPoints,
    status: updated.status
  };
};

// Get a single test session
export const getTestSessionById = async (sessionId: string) => {
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              phone: true
            }
          }
        }
      },
      test: true,
      speakingSlots: {
        include: {
          teacher: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        },
        orderBy: { slotDate: 'asc' }
      }
    }
  });

  if (!session) throw new Error('Test session not found');

  return session;
};

// List sessions with filters
export const listTestSessions = async (filters: {
  status?: string;
  testType?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.TestSessionWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.testType) {
    where.test = { testType: filters.testType };
  }

  const [sessions, total] = await Promise.all([
    prisma.testSession.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: true,
        test: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.testSession.count({ where })
  ]);

  return {
    data: sessions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Finalize session (store decision metadata inside answers JSON)
export const finalizeTestSession = async (input: FinalizeSessionInput) => {
  const session = await prisma.testSession.findUnique({
    where: { id: input.sessionId }
  });

  if (!session) throw new Error('Test session not found');

  const existingAnswers =
    session.answers && typeof session.answers === 'object'
      ? (session.answers as any)
      : {};

  const mergedAnswers: Prisma.InputJsonValue = {
    ...existingAnswers,
    finalDecision: {
      finalLevelId: input.finalLevelId ?? null,
      recommendation: input.recommendation ?? null,
      passed: input.passed ?? null,
      finalizedAt: new Date().toISOString()
    }
  };

  const updated = await prisma.testSession.update({
    where: { id: input.sessionId },
    data: {
      status: 'FINAL_RESULTS',
      answers: mergedAnswers
    }
  });

  return updated;
};
// Add this function to testSession_service.ts

/**
 * Get active test session for a student
 */
export const getActiveSessionForStudent = async (studentId: string) => {
  const session = await prisma.testSession.findFirst({
    where: {
      studentId,
      status: {
        in: ['IN_PROGRESS', 'MCQ_COMPLETED']
      }
    },
    include: {
      test: true,
      student: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!session) {
    throw new Error('No active test session found for this student');
  }

  return session;
};

/**
 * Get the most recent test session for a student and test (regardless of status)
 */
export const getLastTestSession = async (studentId: string, testId: string) => {
  return await prisma.testSession.findFirst({
    where: {
      studentId,
      testId
    },
    include: {
      test: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

