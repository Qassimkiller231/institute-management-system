import { Request, Response } from 'express';
import * as paymentReminderService from '../services/notifications/paymentReminder.service';
import { AuthRequest } from '../types/auth.types';

export const checkAndSendReminders = async (req: AuthRequest, res: Response) => {
  try {
    await paymentReminderService.checkAndSendReminders();
    res.status(200).json({
      success: true,
      message: 'Payment reminders checked and sent successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send payment reminders'
    });
  }
};

export const sendManualReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId } = req.body;
    
    if (!installmentId) {
      return res.status(400).json({
        success: false,
        message: 'installmentId is required'
      });
    }
    
    await paymentReminderService.sendManualReminder(installmentId);
    
    res.status(200).json({
      success: true,
      message: 'Manual payment reminder sent successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send manual reminder'
    });
  }
};

export const getOverduePayments = async (req: AuthRequest, res: Response) => {
  try {
    const overduePayments = await paymentReminderService.getOverduePayments();
    
    res.status(200).json({
      success: true,
      data: overduePayments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch overdue payments'
    });
  }
};