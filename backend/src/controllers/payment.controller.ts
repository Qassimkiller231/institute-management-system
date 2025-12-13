// src/controllers/payment.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as paymentService from '../services/payment.service';
import * as stripeService from '../services/stripe.service';
import prisma from '../utils/db';

/**
 * POST /api/payments/plans
 * Create payment plan
 */
export const createPaymentPlan = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.enrollmentId || !data.totalAmount || !data.totalInstallments) {
      return res.status(400).json({
        success: false,
        message:
          'enrollmentId, totalAmount, and totalInstallments are required',
      });
    }

    if (!data.installments || data.installments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'installments array is required',
      });
    }

    const plan = await paymentService.createPaymentPlan(data);

    res.status(201).json({
      success: true,
      message: 'Payment plan created successfully',
      data: plan,
    });
  } catch (error: any) {
    console.error('Create payment plan error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create payment plan',
    });
  }
};

/**
 * GET /api/payments/plans/enrollment/:enrollmentId
 * Get payment plan by enrollment
 */
export const getPaymentPlanByEnrollment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { enrollmentId } = req.params;

    const plan = await paymentService.getPaymentPlanByEnrollment(enrollmentId);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Get payment plan error:', error);

    if (error.message === 'Payment plan not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment plan',
    });
  }
};

/**
 * GET /api/payments/plans
 * Get all payment plans
 */
export const getAllPaymentPlans = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      termId: req.query.termId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await paymentService.getAllPaymentPlans(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get payment plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment plans',
    });
  }
};


/**
 * GET /api/payments
 * Get all payments (simplified for parents/students)
 */
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get student IDs based on user role
    let studentIds: string[] = [];

    if (userRole === 'PARENT') {
      // Get parent's linked student IDs
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          parentStudentLinks: {
            select: { studentId: true }
          }
        }
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      studentIds = parent.parentStudentLinks.map(link => link.studentId);
    } else if (userRole === 'STUDENT') {
      // Get student's own ID
      const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (student) {
        studentIds = [student.id];
      }
    } else {
      // Admin/Teacher can see all - use default behavior
      const filters = {
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const result = await paymentService.getAllPaymentPlans(filters);

      const payments = result.data.flatMap((plan: any) =>
        plan.installments.map((inst: any) => ({
          id: inst.id,
          amount: inst.amount,
          currency: plan.currency || 'BHD',
          status: inst.paymentStatus,
          description: `Installment ${inst.installmentNumber} of ${plan.totalInstallments}`,
          createdAt: inst.dueDate,
          dueDate: inst.dueDate,
          paidDate: inst.paidDate,
          student: {
            id: plan.enrollment.student.id,
            firstName: plan.enrollment.student.firstName,
            secondName: plan.enrollment.student.secondName,
            thirdName: plan.enrollment.student.thirdName,
          }
        }))
      );

      return res.status(200).json({
        success: true,
        data: payments,
        pagination: result.pagination
      });
    }

    // If no students linked, return empty
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      });
    }

    // Fetch payment plans for the specific students
    const paymentPlans = await prisma.studentPaymentPlan.findMany({
      where: {
        enrollment: {
          studentId: { in: studentIds }
        }
      },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' }
        },
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                secondName: true,
                thirdName: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to simplified payment format
    const payments = paymentPlans.flatMap((plan: any) =>
      plan.installments.map((inst: any) => ({
        id: inst.id,
        amount: inst.amount,
        currency: 'BHD',  // Fixed currency
        status: inst.paymentDate ? 'PAID' : 'UNPAID',  // Derive from paymentDate
        description: `Installment ${inst.installmentNumber} of ${plan.totalInstallments}`,
        createdAt: inst.dueDate,
        dueDate: inst.dueDate,
        paidDate: inst.paymentDate,
        student: {
          id: plan.enrollment.student.id,
          firstName: plan.enrollment.student.firstName,
          secondName: plan.enrollment.student.secondName,
          thirdName: plan.enrollment.student.thirdName,
        }
      }))
    );

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: 1,
        limit: payments.length,
        total: payments.length,
        totalPages: 1
      }
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payments',
    });
  }
};

/**
 * POST /api/payments/installments/:installmentId/pay
 * Record payment for installment
 */
export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId } = req.params;
    const data = req.body;

    if (!data.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'paymentMethod is required',
      });
    }

    // Valid payment methods
    const validMethods = [
      'BENEFIT_PAY',
      'BANK_TRANSFER',
      'CASH',
      'CARD_MACHINE',
    ];
    if (!validMethods.includes(data.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`,
      });
    }

    // Add receiptMakerId from authenticated user
    data.receiptMakerId = req.user!.userId;

    const updated = await paymentService.recordPayment(installmentId, data);

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Record payment error:', error);

    if (error.message === 'Installment not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to record payment',
    });
  }
};

/**
 * PUT /api/payments/installments/:installmentId
 * Update existing payment
 */
export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId } = req.params;
    const data = req.body;

    const updated = await paymentService.updatePayment(installmentId, data);

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Update payment error:', error);

    if (
      error.message === 'Installment not found' ||
      error.message === 'Cannot update unpaid installment. Record payment first.'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment',
    });
  }
};

/**
 * GET /api/payments/balance/enrollment/:enrollmentId
 * Get balance for enrollment
 */
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.params;

    const balance = await paymentService.getBalance(enrollmentId);

    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    console.error('Get balance error:', error);

    if (error.message === 'Payment plan not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch balance',
    });
  }
};

/**
 * POST /api/payments/refunds
 * Create refund request
 */
export const createRefund = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.enrollmentId || !data.refundAmount || !data.refundReason) {
      return res.status(400).json({
        success: false,
        message: 'enrollmentId, refundAmount, and refundReason are required',
      });
    }

    // Add requestedBy from authenticated user
    data.requestedBy = req.user!.userId;

    const refund = await paymentService.createRefund(data);

    res.status(201).json({
      success: true,
      message: 'Refund request created successfully',
      data: refund,
    });
  } catch (error: any) {
    console.error('Create refund error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create refund request',
    });
  }
};

/**
 * PATCH /api/payments/refunds/:refundId/approve
 * Approve refund
 */
export const approveRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { refundId } = req.params;
    const approvedBy = req.user!.userId;

    const refund = await paymentService.approveRefund(refundId, approvedBy);

    res.status(200).json({
      success: true,
      message: 'Refund approved successfully',
      data: refund,
    });
  } catch (error: any) {
    console.error('Approve refund error:', error);

    if (
      error.message === 'Refund not found' ||
      error.message === 'Refund already processed'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve refund',
    });
  }
};

/**
 * PATCH /api/payments/refunds/:refundId/process
 * Process refund (complete)
 */
export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { refundId } = req.params;
    const { receiptUrl } = req.body;
    const processedBy = req.user!.userId;

    const refund = await paymentService.processRefund(
      refundId,
      processedBy,
      receiptUrl
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund,
    });
  } catch (error: any) {
    console.error('Process refund error:', error);

    if (
      error.message === 'Refund not found' ||
      error.message === 'Refund must be approved first'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund',
    });
  }
};

/**
 * GET /api/payments/refunds
 * Get all refunds
 */
export const getAllRefunds = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      enrollmentId: req.query.enrollmentId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };

    const result = await paymentService.getAllRefunds(filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch refunds',
    });
  }
};


// stripe 
export const createStripeIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId, amount, currency } = req.body;

    if (!installmentId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'installmentId, amount, and currency are required',
      });
    }

    const installment = await paymentService.getInstallmentWithStudent(installmentId);

    const result = await stripeService.createPaymentIntent({
      amount,
      currency,
      installmentId,
      studentEmail: installment.paymentPlan.enrollment.student.user.email,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Stripe intent error:', error);

    if (error.message === 'Installment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
};

export const confirmStripePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId, installmentId } = req.body;

    if (!paymentIntentId || !installmentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId and installmentId are required',
      });
    }

    const result = await stripeService.confirmPayment(paymentIntentId);

    // Extract receipt URL from Stripe (if available)
    const paymentIntent = result.paymentIntent as any;
    const receiptUrl = paymentIntent.latest_charge?.receipt_url || null;

    await paymentService.recordPayment(installmentId, {
      paymentMethod: 'ONLINE_PAYMENT',
      receiptNumber: `STRIPE-${paymentIntentId}`,
      receiptUrl: receiptUrl,
      notes: `Stripe Payment Intent: ${paymentIntentId}`,
      receiptMakerId: req.user!.userId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Stripe confirm error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to confirm payment',
    });
  }
};