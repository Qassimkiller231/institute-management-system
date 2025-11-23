// src/services/analytics/financialAnalytics.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Monthly dues (per month + per program)
export const getMonthlyProgramDues = async (year?: number) => {
  const targetYear = year ?? new Date().getFullYear();
  const start = new Date(targetYear, 0, 1);
  const end = new Date(targetYear + 1, 0, 1);

  const installments = await prisma.installment.findMany({
    where: { paymentDate: { gte: start, lt: end } },
    include: {
      paymentPlan: {
        include: {
          enrollment: {
            include: {
              group: {
                include: {
                  term: { include: { program: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  const buckets: any = {};

  for (const inst of installments) {
    const program = inst.paymentPlan?.enrollment?.group?.term?.program;
    if (!program) continue;
    if(!inst.paymentDate) continue;
    const month = inst.paymentDate.getMonth() + 1;
    const amount = Number(inst.amount);

    if (!buckets[month]) {
      buckets[month] = { totalAmount: 0, programs: {} as any };
    }

    buckets[month].totalAmount += amount;

    if (!buckets[month].programs[program.id]) {
      buckets[month].programs[program.id] = {
        programId: program.id,
        programName: program.name,
        totalAmount: 0
      };
    }

    buckets[month].programs[program.id].totalAmount += amount;
  }

  return {
    year: targetYear,
    months: Object.keys(buckets)
      .map((m) => Number(m))
      .sort((a, b) => a - b)
      .map((m) => ({
        month: m,
        totalAmount: buckets[m].totalAmount,
        programs: Object.values(buckets[m].programs)
      }))
  };
};

// 2. Term dues overview
export const getTermDuesOverview = async (termId: string) => {
  const term = await prisma.term.findUnique({
    where: { id: termId },
    include: { program: true }
  });

  if (!term) throw new Error('Term not found');

  const plans = await prisma.studentPaymentPlan.findMany({
    where: { enrollment: { group: { termId } } },
    include: { installments: true }
  });

  let planned = 0;
  let paid = 0;

  for (const p of plans) {
    planned += Number(p.finalAmount);
    for (const inst of p.installments) {
      paid += Number(inst.amount);
    }
  }

  return {
    term: {
      id: term.id,
      name: term.name,
      programId: term.programId,
      programName: term.program.name
    },
    totalPlans: plans.length,
    totalPlanned: planned,
    totalPaid: paid,
    outstanding: planned - paid
  };
};