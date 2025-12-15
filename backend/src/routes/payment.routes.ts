// src/routes/payment.routes.ts
import express from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireAnyRole } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== PAYMENTS ====================

// Get all payments (All authenticated users)
router.get('/', requireAnyRole, paymentController.getAllPayments);

// ==================== PAYMENT PLANS ====================

// Create payment plan (Admin only)
router.post('/plans', requireAdmin, paymentController.createPaymentPlan);

// Get all payment plans (Admin only)
router.get('/plans', requireAdmin, paymentController.getAllPaymentPlans);

// Update payment plan (Admin only)
router.put('/plans/:id', requireAdmin, paymentController.updatePaymentPlan);

// Delete payment plan (Admin only)
router.delete('/plans/:id', requireAdmin, paymentController.deletePaymentPlan);

// Get payment plan by enrollment (Admin or student owner)
router.get(
  '/plans/enrollment/:enrollmentId',
  paymentController.getPaymentPlanByEnrollment
);

// Get balance (Admin or student owner)
router.get(
  '/balance/enrollment/:enrollmentId',
  paymentController.getBalance
);

// ==================== INSTALLMENTS ====================

// Add new installment to plan (Admin only)
router.post(
  '/plans/:planId/installments',
  requireAdmin,
  paymentController.addInstallment
);

// Update installment (Admin only)
router.put(
  '/installments/:installmentId/details',
  requireAdmin,
  paymentController.updateInstallmentDetails
);

// Delete installment (Admin only)
router.delete(
  '/installments/:installmentId',
  requireAdmin,
  paymentController.deleteInstallment
);

// Record payment (Admin only)
router.post(
  '/installments/:installmentId/pay',
  requireAdmin,
  paymentController.recordPayment
);
// Update payment (Admin only)
router.put(
  '/installments/:installmentId',
  requireAdmin,
  paymentController.updatePayment
);

// ==================== REFUNDS ====================

// Create refund request (Anyone can request)
router.post('/refunds', paymentController.createRefund);

// Get all refunds (Admin only)
router.get('/refunds', requireAdmin, paymentController.getAllRefunds);

// Approve refund (Admin only)
router.patch(
  '/refunds/:refundId/approve',
  requireAdmin,
  paymentController.approveRefund
);

// Process refund (Admin only)
router.patch(
  '/refunds/:refundId/process',
  requireAdmin,
  paymentController.processRefund
);
router.post('/stripe/create-intent', paymentController.createStripeIntent);
router.post('/stripe/confirm', paymentController.confirmStripePayment);
export default router;