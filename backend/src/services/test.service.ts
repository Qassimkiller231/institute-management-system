// src/services/test.service.ts
import prisma from '../utils/db';


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
 * Update test metadata
 */
export const updateTest = async (
  testId: string,
  data: Partial<{
    name: string;
    testType: TestType | string;
    levelId: string | null;
    durationMinutes: number;
    isActive: boolean;
  }>
) => {
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error('Test not found');

  return prisma.test.update({
    where: { id: testId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.testType !== undefined && { testType: data.testType }),
      ...(data.levelId !== undefined && { levelId: data.levelId }),
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
};

/**
 * Delete test (cascades questions)
 */
export const deleteTest = async (testId: string) => {
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error('Test not found');
  await prisma.test.delete({ where: { id: testId } });
  return { id: testId };
};

/**
 * Update a question
 */
export const updateQuestion = async (
  questionId: string,
  data: Partial<{
    questionText: string;
    questionType: string;
    options: any;
    correctAnswer: string;
    points: number;
    orderNumber: number;
  }>
) => {
  const q = await prisma.testQuestion.findUnique({ where: { id: questionId } });
  if (!q) throw new Error('Question not found');

  return prisma.testQuestion.update({
    where: { id: questionId },
    data: {
      ...(data.questionText !== undefined && { questionText: data.questionText }),
      ...(data.questionType !== undefined && { questionType: data.questionType }),
      ...(data.options !== undefined && { options: data.options }),
      ...(data.correctAnswer !== undefined && { correctAnswer: data.correctAnswer }),
      ...(data.points !== undefined && { points: data.points }),
      ...(data.orderNumber !== undefined && { orderNumber: data.orderNumber }),
    },
  });
};

/**
 * Delete a question and resync totalQuestions
 */
export const deleteQuestion = async (questionId: string) => {
  const q = await prisma.testQuestion.findUnique({ where: { id: questionId } });
  if (!q) throw new Error('Question not found');

  await prisma.testQuestion.delete({ where: { id: questionId } });

  const count = await prisma.testQuestion.count({ where: { testId: q.testId } });
  await prisma.test.update({
    where: { id: q.testId },
    data: { totalQuestions: count },
  });

  return { id: questionId };
};

/**
 * Bulk reorder questions for a test.
 * Accepts an array of { id, orderNumber } pairs.
 */
export const reorderQuestions = async (
  testId: string,
  orders: { id: string; orderNumber: number }[]
) => {
  await prisma.$transaction(
    orders.map(o =>
      prisma.testQuestion.update({
        where: { id: o.id },
        data: { orderNumber: o.orderNumber },
      })
    )
  );
  return { testId, count: orders.length };
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
