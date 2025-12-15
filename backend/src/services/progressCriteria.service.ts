// src/services/progressCriteria.service.ts
import { PrismaClient, ProgressCriteria } from '@prisma/client';

const prisma = new PrismaClient();

const safePercent = (num: number, den: number) =>
  den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0;

/**
 * ---------- TYPES ----------
 */

export interface ProgressCriteriaCreateInput {
  levelId?: string | null;
  groupId?: string | null;
  name: string;
  description?: string | null;
  orderNumber?: number | null;
}

export interface ProgressCriteriaUpdateInput {
  name?: string;
  description?: string | null;
  levelId?: string | null;
  groupId?: string | null;
  orderNumber?: number | null;
  isActive?: boolean;
}

export interface ProgressCriteriaFilter {
  levelId?: string;
  groupId?: string;
  isActive?: boolean;
}

export interface StudentCriteriaProgressParams {
  studentId: string;
  enrollmentId?: string | null;
  groupId?: string;
  levelId?: string;
  includeInactive?: boolean;
}

/**
 * ---------- CRUD FOR CRITERIA ----------
 */

// Create criteria
export const createProgressCriteria = async (
  data: ProgressCriteriaCreateInput
): Promise<ProgressCriteria> => {
  if (!data.levelId && !data.groupId) {
    throw new Error('Either levelId or groupId must be provided');
  }

  return prisma.progressCriteria.create({
    data: {
      levelId: data.levelId ?? null,
      groupId: data.groupId ?? null,
      name: data.name,
      description: data.description ?? null,
      orderNumber: data.orderNumber ?? null
    }
  });
};

// Update criteria
export const updateProgressCriteria = async (
  id: string,
  data: ProgressCriteriaUpdateInput
): Promise<ProgressCriteria> => {
  const existing = await prisma.progressCriteria.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Progress criteria not found');
  }

  return prisma.progressCriteria.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      description:
        data.description !== undefined ? data.description : existing.description,
      levelId:
        data.levelId !== undefined ? data.levelId : existing.levelId,
      groupId:
        data.groupId !== undefined ? data.groupId : existing.groupId,
      orderNumber:
        data.orderNumber !== undefined ? data.orderNumber : existing.orderNumber,
      isActive:
        data.isActive !== undefined ? data.isActive : existing.isActive
    }
  });
};

// Soft deactivate / activate
export const setProgressCriteriaActive = async (
  id: string,
  isActive: boolean
): Promise<ProgressCriteria> => {
  const existing = await prisma.progressCriteria.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Progress criteria not found');
  }

  return prisma.progressCriteria.update({
    where: { id },
    data: { isActive }
  });
};

// Hard delete (use carefully – mostly for admin tools)
export const deleteProgressCriteriaHard = async (id: string): Promise<void> => {
  const existing = await prisma.progressCriteria.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Progress criteria not found');
  }

  await prisma.progressCriteria.delete({ where: { id } });
};

// Get by ID
export const getProgressCriteriaById = async (
  id: string
): Promise<ProgressCriteria> => {
  const criteria = await prisma.progressCriteria.findUnique({ where: { id } });
  if (!criteria) {
    throw new Error('Progress criteria not found');
  }
  return criteria;
};

// List criteria with filters
export const listProgressCriteria = async (
  filter: ProgressCriteriaFilter = {}
): Promise<ProgressCriteria[]> => {
  const { levelId, isActive } = filter;

  console.log('🔍 [listProgressCriteria] Input filter:', { levelId, isActive });

  const where: any = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  // Query by levelId only (criteria are per-level, not per-group)
  if (levelId) {
    where.levelId = levelId;
  }

  console.log('🔍 [listProgressCriteria] Final where clause:', JSON.stringify(where, null, 2));

  const results = await prisma.progressCriteria.findMany({
    where,
    orderBy: [
      { orderNumber: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  console.log('🔍 [listProgressCriteria] Results count:', results.length);
  if (results.length > 0) {
    console.log('🔍 [listProgressCriteria] First result:', results[0]);
  }

  return results;
};

/**
 * ---------- STUDENT COMPLETIONS ----------
 */

export interface SetStudentCriteriaCompletionInput {
  studentId: string;
  criteriaId: string;
  enrollmentId?: string | null;
  completed: boolean;
  completedAt?: Date | null;
}

// Create / update completion for a student + criteria (+ optional enrollment)
export const setStudentCriteriaCompletion = async (
  studentId: string,
  criteriaId: string,
  enrollmentId: string,       // 👈 now required, no null
  completed: boolean,
  completionDate?: Date
) => {
  const completedAt = completionDate ?? new Date();

  return prisma.studentCriteriaCompletion.upsert({
    where: {
      studentId_criteriaId_enrollmentId: {
        studentId,
        criteriaId,
        enrollmentId,          // 👈 just string
      },
    },
    update: {
      completed,
      completedAt,
    },
    create: {
      studentId,
      criteriaId,
      enrollmentId,          // 👈 just string
      completed,
      completedAt,
    },
  });
};

// Get full criteria + completion status for one student
export const getStudentCriteriaProgress = async (
  params: StudentCriteriaProgressParams
) => {
  const {
    studentId,
    enrollmentId = null,
    groupId,
    levelId,
    includeInactive = false
  } = params;

  if (!groupId && !levelId) {
    throw new Error('Either groupId or levelId must be provided');
  }

  const whereCriteria: any = {
    ...(includeInactive ? {} : { isActive: true })
  };

  const orConditions: any[] = [];
  if (groupId) orConditions.push({ groupId });
  if (levelId) orConditions.push({ levelId });

  if (orConditions.length > 0) {
    whereCriteria.OR = orConditions;
  }

  const criteriaList = await prisma.progressCriteria.findMany({
    where: whereCriteria,
    orderBy: [
      { orderNumber: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  if (criteriaList.length === 0) {
    return {
      studentId,
      enrollmentId,
      totalCriteria: 0,
      completedCount: 0,
      progressPercentage: 0,
      criteria: []
    };
  }

  const completions = await prisma.studentCriteriaCompletion.findMany({
    where: {
      studentId,
      criteriaId: { in: criteriaList.map((c) => c.id) },
      enrollmentId
    }
  });

  const criteriaWithStatus = criteriaList.map((c) => {
    const match = completions.find(
      (sc) => sc.criteriaId === c.id && sc.completed
    );
    return {
      criteriaId: c.id,
      name: c.name,
      description: c.description,
      orderNumber: c.orderNumber,
      completed: !!match,
      completedAt: match?.completedAt ?? null
    };
  });

  const completedCount = criteriaWithStatus.filter((c) => c.completed).length;
  const progressPercentage = safePercent(
    completedCount,
    criteriaWithStatus.length
  );

  return {
    studentId,
    enrollmentId,
    totalCriteria: criteriaWithStatus.length,
    completedCount,
    progressPercentage,
    criteria: criteriaWithStatus
  };
};