// src/services/payment.service.ts
import { PrismaClient } from '@prisma/client';
import { calculateInstallmentStatus } from '../utils/paymentHelpers';

const prisma = new PrismaClient();

/**
 * Create Payment Plan for an enrollment
 */
export const createPaymentPlan = async (data: {
  enrollmentId: string;
  totalAmount: number;
  discountAmount?: number;
  discountReason?: string;
  totalInstallments: number;
  installments: {
    installmentNumber: number;
    amount: number;
    paymentDate: string; // Due date
  }[];
}) => {
  // Check enrollment exists
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: data.enrollmentId },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  // Check if payment plan already exists
  const existing = await prisma.studentPaymentPlan.findUnique({
    where: { enrollmentId: data.enrollmentId },
  });

  if (existing) {
    throw new Error('Payment plan already exists for this enrollment');
  }

  const finalAmount = data.totalAmount - (data.discountAmount || 0);

  // Create plan + installments in transaction
  const result = await prisma.$transaction(async (tx) => {
    const plan = await tx.studentPaymentPlan.create({
      data: {
        enrollmentId: data.enrollmentId,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        discountReason: data.discountReason,
        finalAmount: finalAmount,
        totalInstallments: data.totalInstallments,
        status: 'ACTIVE',
      },
    });

    // Create installments
    for (const inst of data.installments) {
      await tx.installment.create({
        data: {
          paymentPlanId: plan.id,
          installmentNumber: inst.installmentNumber,
          amount: inst.amount,
          dueDate: new Date(inst.paymentDate), // This is actually the due date
          paymentMethod: null, // NULL until paid
          paymentDate: null, // NULL until paid
        },
      });
    }

    return tx.studentPaymentPlan.findUnique({
      where: { id: plan.id },
      include: {
        installments: { orderBy: { installmentNumber: 'asc' } },
        enrollment: {
          include: {
            student: true,
            group: { include: { term: true, level: true } },
          },
        },
      },
    });
  });

  return result;
};

/**
 * Get Payment Plan by Enrollment ID
 */
export const getPaymentPlanByEnrollment = async (enrollmentId: string) => {
  const plan = await prisma.studentPaymentPlan.findUnique({
    where: { enrollmentId },
    include: {
      installments: { orderBy: { installmentNumber: 'asc' } },
      enrollment: {
        include: {
          student: true,
          group: { include: { term: true, level: true } },
        },
      },
    },
  });

  if (!plan) {
    throw new Error('Payment plan not found');
  }

  // Add calculated status to each installment
  const planWithStatus = {
    ...plan,
    installments: plan.installments.map(inst => ({
      ...inst,
      status: calculateInstallmentStatus(inst)
    }))
  };

  return planWithStatus;
};

/**
 * Get all payment plans with filters
 */
export const getAllPaymentPlans = async (filters: {
  status?: string;
  termId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.termId) {
    where.enrollment = { group: { termId: filters.termId } };
  }

  const [plans, total] = await Promise.all([
    prisma.studentPaymentPlan.findMany({
      where,
      skip,
      take: limit,
      include: {
        installments: true,
        enrollment: {
          include: {
            student: true,
            group: { include: { term: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentPaymentPlan.count({ where }),
  ]);

  return {
    data: plans,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Record a payment for an installment
 */
export const recordPayment = async (
  installmentId: string,
  data: {
    paymentMethod: string;
    receiptNumber?: string;
    receiptUrl?: string;
    receiptMakerId?: string;
    benefitReferenceNumber?: string;
    notes?: string;
  }
) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { paymentPlan: true },
  });

  if (!installment) {
    throw new Error('Installment not found');
  }

  // ✅ CHECK: Prevent recording payment if already paid
  // A payment is considered paid if it has a paymentDate (not null)
  if (installment.paymentDate) {
    throw new Error(
      'Installment already paid. Use update endpoint to modify payment details.'
    );
  }

  // Update installment
  const updated = await prisma.installment.update({
    where: { id: installmentId },
    data: {
      paymentMethod: data.paymentMethod,
      paymentDate: new Date(), // Set payment date to now
      receiptNumber: data.receiptNumber,
      receiptUrl: data.receiptUrl,
      receiptMakerId: data.receiptMakerId,
      benefitReferenceNumber: data.benefitReferenceNumber,
      notes: data.notes,
    },
    include: {
      paymentPlan: {
        include: {
          installments: true,
          enrollment: { include: { student: true } },
        },
      },
    },
  });

  // Calculate balance for receipt
  const totalPaid = updated.paymentPlan.installments
    .filter((i) => i.paymentDate !== null)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const balance = Number(updated.paymentPlan.finalAmount) - totalPaid;

  // Send Email Receipt
  try {
    const student = updated.paymentPlan.enrollment.student;
    // We need to fetch the user email if it wasn't included in the previous include
    // The previous include was: include: { paymentPlan: { include: { installments: true, enrollment: { include: { student: true } } } } }
    // Student model usually has userId, so we need to fetch User to get email. 
    // Optimization: Let's fetch it if missing, or update the include above.
    // However, since we already have 'updated', let's just fetch the user email separately to be safe and clean.

    const user = await prisma.user.findUnique({
      where: { id: student.userId },
      select: { email: true }
    });

    if (user && user.email) {
      // Dynamic import to avoid circular dependencies if any, or just standard import at top
      const emailService = require('./email.service');

      // Construct full name safely
      const nameParts = [
        student.firstName,
        student.secondName,
        student.thirdName
      ].filter(Boolean); // Remove null/undefined/empty string

      const fullName = nameParts.length > 0 ? nameParts.join(' ') : 'Student';

      await emailService.sendPaymentReceiptEmail({
        to: user.email,
        studentName: fullName,
        receiptNumber: data.receiptNumber || 'N/A',
        amount: Number(installment.amount),
        currency: 'BHD',
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(),
        installmentNumber: installment.installmentNumber,
        balance: balance
      });
    }
  } catch (emailErr) {
    console.error('Failed to send email receipt:', emailErr);
    // Continue execution, don't block payment recording
  }

  return updated;
};

/**
 * Update existing payment record
 */
export const updatePayment = async (
  installmentId: string,
  data: {
    paymentMethod?: string;
    receiptNumber?: string;
    receiptUrl?: string;
    benefitReferenceNumber?: string;
    notes?: string;
  }
) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
  });

  if (!installment) {
    throw new Error('Installment not found');
  }

  // ✅ CHECK: Must already be paid to update
  // A payment is paid if it has a paymentDate
  if (!installment.paymentDate) {
    throw new Error('Cannot update unpaid installment. Record payment first.');
  }

  return await prisma.installment.update({
    where: { id: installmentId },
    data,
    include: {
      paymentPlan: {
        include: {
          installments: true,
          enrollment: { include: { student: true } },
        },
      },
    },
  });
};

/**
 * Get balance for a payment plan
 */
export const getBalance = async (enrollmentId: string) => {
  const plan = await prisma.studentPaymentPlan.findUnique({
    where: { enrollmentId },
    include: { installments: true },
  });

  if (!plan) {
    throw new Error('Payment plan not found');
  }

  const totalPaid = plan.installments
    .filter((i) => i.paymentDate !== null)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const balance = Number(plan.finalAmount) - totalPaid;

  const paidInstallments = plan.installments.filter(
    (i) => i.paymentDate !== null
  ).length;

  const remainingInstallments = plan.totalInstallments - paidInstallments;

  // Find next unpaid installment
  const nextUnpaid = plan.installments
    .filter((i) => i.paymentDate === null)
    .sort((a, b) => a.installmentNumber - b.installmentNumber)[0];

  return {
    totalAmount: Number(plan.totalAmount),
    discountAmount: Number(plan.discountAmount),
    finalAmount: Number(plan.finalAmount),
    totalPaid,
    balance,
    totalInstallments: plan.totalInstallments,
    paidInstallments,
    remainingInstallments,
    nextDueDate: nextUnpaid?.paymentDate || null,
    nextDueAmount: nextUnpaid ? Number(nextUnpaid.amount) : 0,
  };
};

/**
 * Create refund request
 */
export const createRefund = async (data: {
  installmentId?: string;
  enrollmentId: string;
  refundAmount: number;
  refundReason: string;
  refundMethod?: string;
  requestedBy: string; // userId
  notes?: string;
}) => {
  // Verify enrollment exists
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: data.enrollmentId },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  const refund = await prisma.refund.create({
    data: {
      installmentId: data.installmentId,
      enrollmentId: data.enrollmentId,
      refundAmount: data.refundAmount,
      refundReason: data.refundReason,
      refundMethod: data.refundMethod,
      requestedBy: data.requestedBy,
      status: 'PENDING',
      notes: data.notes,
    },
    include: {
      installment: true,
      enrollment: { include: { student: true } },
      requester: true,
    },
  });

  return refund;
};

/**
 * Approve refund
 */
export const approveRefund = async (refundId: string, approvedBy: string) => {
  const refund = await prisma.refund.findUnique({ where: { id: refundId } });

  if (!refund) {
    throw new Error('Refund not found');
  }

  if (refund.status !== 'PENDING') {
    throw new Error('Refund already processed');
  }

  return await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    },
    include: {
      enrollment: { include: { student: true } },
    },
  });
};

/**
 * Process refund (mark as completed)
 */
export const processRefund = async (
  refundId: string,
  processedBy: string,
  receiptUrl?: string
) => {
  const refund = await prisma.refund.findUnique({ where: { id: refundId } });

  if (!refund) {
    throw new Error('Refund not found');
  }

  if (refund.status !== 'APPROVED') {
    throw new Error('Refund must be approved first');
  }

  return await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: 'COMPLETED',
      processedBy,
      processedAt: new Date(),
      receiptUrl,
    },
  });
};

/**
 * Get all refunds
 */
export const getAllRefunds = async (filters: {
  status?: string;
  enrollmentId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      skip,
      take: limit,
      include: {
        installment: true,
        enrollment: { include: { student: true } },
        requester: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.refund.count({ where }),
  ]);

  return {
    data: refunds,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// stripe 
export const getInstallmentWithStudent = async (installmentId: string) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: {
      paymentPlan: {
        include: {
          enrollment: {
            include: { student: { include: { user: true } } }
          }
        }
      }
    }
  });

  if (!installment) {
    throw new Error('Installment not found');
  }

  return installment;
};

/**
 * Update Payment Plan
 */
export const updatePaymentPlan = async (
  planId: string,
  updates: {
    totalAmount?: number;
    discountAmount?: number;
    discountReason?: string;
  }
) => {
  const plan = await prisma.studentPaymentPlan.findUnique({
    where: { id: planId },
    include: { installments: true }
  });

  if (!plan) {
    throw new Error('Payment plan not found');
  }

  // Recalculate final amount if total or discount changed
  const totalAmount = updates.totalAmount ?? plan.totalAmount;
  const discountAmount = updates.discountAmount ?? plan.discountAmount;
  const finalAmount = Number(totalAmount) - Number(discountAmount);

  return await prisma.studentPaymentPlan.update({
    where: { id: planId },
    data: {
      ...(updates.totalAmount !== undefined && { totalAmount: updates.totalAmount }),
      ...(updates.discountAmount !== undefined && { discountAmount: updates.discountAmount }),
      ...(updates.discountReason !== undefined && { discountReason: updates.discountReason }),
      finalAmount
    },
    include: {
      installments: { orderBy: { installmentNumber: 'asc' } },
      enrollment: {
        include: {
          student: true,
          group: { include: { term: true, level: true } }
        }
      }
    }
  });
};

/**
 * Delete Payment Plan (soft or hard delete)
 */
export const deletePaymentPlan = async (planId: string) => {
  const plan = await prisma.studentPaymentPlan.findUnique({
    where: { id: planId },
    include: { installments: true }
  });

  if (!plan) {
    throw new Error('Payment plan not found');
  }

  // Check if any installments have been paid
  const hasPaidInstallments = plan.installments.some(inst => inst.paymentDate !== null);

  if (hasPaidInstallments) {
    throw new Error('Cannot delete payment plan with paid installments. Please contact admin for assistance.');
  }

  // Hard delete (cascade will remove installments automatically)
  return await prisma.studentPaymentPlan.delete({
    where: { id: planId }
  });
};

/**
 * Add a new installment to an existing payment plan
 */
export const addInstallment = async (
  planId: string,
  data: {
    amount: number;
    dueDate: string;
  }
) => {
  const plan = await prisma.studentPaymentPlan.findUnique({
    where: { id: planId },
    include: { installments: true }
  });

  if (!plan) {
    throw new Error('Payment plan not found');
  }

  // Get next installment number
  const maxInstallmentNumber = Math.max(...plan.installments.map(i => i.installmentNumber), 0);

  return await prisma.installment.create({
    data: {
      paymentPlanId: planId,
      installmentNumber: maxInstallmentNumber + 1,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      paymentMethod: null,
      paymentDate: null
    }
  });
};

/**
 * Update an installment
 */
export const updateInstallment = async (
  installmentId: string,
  updates: {
    amount?: number;
    dueDate?: string;
  }
) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId }
  });

  if (!installment) {
    throw new Error('Installment not found');
  }

  // Don't allow editing paid installments
  if (installment.paymentDate) {
    throw new Error('Cannot edit a paid installment');
  }

  return await prisma.installment.update({
    where: { id: installmentId },
    data: {
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.dueDate && { dueDate: new Date(updates.dueDate) })
    }
  });
};

/**
 * Delete an installment
 */
export const deleteInstallment = async (installmentId: string) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId }
  });

  if (!installment) {
    throw new Error('Installment not found');
  }

  // Don't allow deleting paid installments
  if (installment.paymentDate) {
    throw new Error('Cannot delete a paid installment');
  }

  return await prisma.installment.delete({
    where: { id: installmentId }
  });
};