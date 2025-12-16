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
    if (!inst.paymentDate) continue;
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
  const monthlyData: Map<string, { collected: number; expected: number }> = new Map();
  const paymentMethods: Record<string, number> = {};

  for (const p of plans) {
    planned += Number(p.finalAmount);

    for (const inst of p.installments) {
      // Track expected for each month based on due date
      if (inst.dueDate) {
        const dueKey = `${inst.dueDate.getFullYear()}-${String(inst.dueDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData.has(dueKey)) {
          monthlyData.set(dueKey, { collected: 0, expected: 0 });
        }
        monthlyData.get(dueKey)!.expected += Number(inst.amount);
      }

      // Only count as paid if payment date exists
      if (inst.paymentDate) {
        const amount = Number(inst.amount);
        paid += amount;

        // Group by payment month
        const paidKey = `${inst.paymentDate.getFullYear()}-${String(inst.paymentDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData.has(paidKey)) {
          monthlyData.set(paidKey, { collected: 0, expected: 0 });
        }
        monthlyData.get(paidKey)!.collected += amount;

        // Track payment methods
        const method = inst.paymentMethod || 'CASH';
        paymentMethods[method] = (paymentMethods[method] || 0) + amount;
      }
    }
  }

  // Format monthly trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split('-');
      const monthName = monthNames[parseInt(month) - 1];
      return {
        month: `${monthName} ${year}`,
        collected: val.collected,
        expected: val.expected,
        difference: val.collected - val.expected
      };
    });

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
    outstanding: planned - paid,
    monthlyTrend,
    paymentMethods
  };
};

// 3. Overall financial analytics (all terms)
export const getOverallFinancialAnalytics = async () => {
  // Get ALL payment plans with their installments and program info
  const plans = await prisma.studentPaymentPlan.findMany({
    include: {
      installments: true,
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
  });

  let totalPlanned = 0;
  let totalPaid = 0;
  const monthlyData: Map<string, { collected: number; expected: number }> = new Map();
  const paymentMethods: Record<string, number> = {};

  for (const plan of plans) {
    const planAmount = Number(plan.finalAmount);
    totalPlanned += planAmount;

    // Calculate monthly expected based on plan amount divided by installments
    const expectedPerMonth = plan.installments.length > 0
      ? planAmount / plan.installments.length
      : 0;

    for (const inst of plan.installments) {
      // Track expected for each month based on due date
      if (inst.dueDate) {
        const dueKey = `${inst.dueDate.getFullYear()}-${String(inst.dueDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData.has(dueKey)) {
          monthlyData.set(dueKey, { collected: 0, expected: 0 });
        }
        monthlyData.get(dueKey)!.expected += Number(inst.amount);
      }

      // Track actual payments
      if (inst.paymentDate) {
        const amount = Number(inst.amount);
        totalPaid += amount;

        // Group by payment month
        const paidKey = `${inst.paymentDate.getFullYear()}-${String(inst.paymentDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData.has(paidKey)) {
          monthlyData.set(paidKey, { collected: 0, expected: 0 });
        }
        monthlyData.get(paidKey)!.collected += amount;

        // Track payment methods
        const method = inst.paymentMethod || 'CASH';
        paymentMethods[method] = (paymentMethods[method] || 0) + amount;
      }
    }
  }

  // Format monthly trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split('-');
      const monthName = monthNames[parseInt(month) - 1];
      return {
        month: `${monthName} ${year}`,
        collected: val.collected,
        expected: val.expected,
        difference: val.collected - val.expected
      };
    });

  return {
    totalPlanned,
    totalPaid,
    outstanding: totalPlanned - totalPaid,
    monthlyTrend,
    paymentMethods
  };
};