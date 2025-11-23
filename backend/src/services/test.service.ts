// src/services/test.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// In DB it's just string, but we narrow it for the service
export type TestType = "PLACEMENT" | "SPEAKING" | "WRITTEN" | "UPGRADE";

/**
 * Create a new test
 * NOTE: DB uses `name` (not `title`) and does not have ageMin/ageMax/etc.
 */
export const createTest = async (data: {
  testType: TestType | string;
  name: string; // you can map `title` -> `name` in the controller
  levelId?: string;
  durationMinutes?: number;
  totalQuestions?: number;
}) => {
  const test = await prisma.test.create({
    data: {
      testType: data.testType,
      name: data.name,
      levelId: data.levelId ?? null,
      durationMinutes: data.durationMinutes ?? 45,
      totalQuestions: data.totalQuestions ?? 0,
      isActive: true,
    },
  });

  return test;
};

/**
 * Add a question to a test
 */
export const addQuestionToTest = async (
  testId: string,
  data: {
    questionText: string;
    questionType: string;
    options?: any; // JSON – usually string[]
    correctAnswer: string;
    points?: number;
    orderNumber: number;
  }
) => {
  // Ensure test exists
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) {
    throw new Error("Test not found");
  }

  const question = await prisma.testQuestion.create({
    data: {
      testId,
      questionText: data.questionText,
      questionType: data.questionType,
      options: data.options ?? null,
      correctAnswer: data.correctAnswer,
      points: data.points ?? 1,
      orderNumber: data.orderNumber,
    },
  });

  // Optionally update totalQuestions to keep it in sync
  const currentCount = await prisma.testQuestion.count({
    where: { testId },
  });
  await prisma.test.update({
    where: { id: testId },
    data: { totalQuestions: currentCount },
  });
  
  // await prisma.test.update({
  //   where: { id: testId },
  //   data: { totalQuestions: test.totalQuestions + 1 }
  // });

  return question;
};

/**
 * Get all tests (simple list)
 */
export const getTests = async (filters: {
  testType?: TestType | string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.testType) where.testType = filters.testType;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [tests, total] = await Promise.all([
    prisma.test.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.test.count({ where }),
  ]);

  return {
    tests: tests.map((t) => ({
      id: t.id,
      testType: t.testType,
      name: t.name,
      totalQuestions: t.totalQuestions,
      durationMinutes: t.durationMinutes,
      isActive: t.isActive,
      createdAt: t.createdAt,
    })),
    total,
    page,
    limit,
  };
};

/**
 * Get single test with all its questions
 */
export const getTestById = async (testId: string) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: {
        orderBy: { orderNumber: "asc" },
      },
    },
  });

  if (!test) {
    throw new Error("Test not found");
  }

  return {
    id: test.id,
    testType: test.testType,
    name: test.name,
    levelId: test.levelId,
    totalQuestions: test.totalQuestions,
    durationMinutes: test.durationMinutes,
    isActive: test.isActive,
    questions: test.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      orderNumber: q.orderNumber,
    })),
  };
};
