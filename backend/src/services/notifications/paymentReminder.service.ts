import { PrismaClient } from '@prisma/client';
import * as emailService from './email.service';
import * as smsService from './sms.service';

const prisma = new PrismaClient();

export const checkAndSendReminders = async () => {
  const now = new Date();
  
  const installments = await prisma.installment.findMany({
    where: {
      paymentDate: null,
      dueDate: { not: null }
    },
    include: {
      paymentPlan: {
        include: {
          enrollment: {
            include: {
              student: {
                include: {
                  user: true,
                  parentStudentLinks: {
                    include: {
                      parent: { include: { user: true } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  
  for (const installment of installments) {
    if (!installment.dueDate) continue;
    
    const daysUntilDue = Math.ceil(
      (installment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let reminderType: string | null = null;
    
    if (daysUntilDue === 3) {
      reminderType = '3_DAYS_BEFORE';
    } else if (daysUntilDue === 1) {
      reminderType = '1_DAY_BEFORE';
    } else if (daysUntilDue === 0) {
      reminderType = 'DUE_DATE';
    } else if (daysUntilDue < 0) {
      reminderType = 'OVERDUE';
    }
    
    if (reminderType) {
      await sendPaymentReminder(installment, reminderType);
    }
  }
};

async function sendPaymentReminder(installment: any, reminderType: string) {
  const student = installment.paymentPlan.enrollment.student;
  const studentEmail = student.user.email;
  const studentPhone = student.user.phone;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingReminder = await prisma.paymentReminder.findFirst({
    where: {
      installmentId: installment.id,
      reminderType,
      sentAt: { gte: today }
    }
  });
  
  if (existingReminder) {
    console.log(`Reminder already sent for installment ${installment.id}`);
    return;
  }
  
  const smsMessage = generateSMSMessage(
    installment.amount || 0,
    installment.dueDate,
    reminderType
  );
  
  // Send email to student
  if (studentEmail) {
    try {
      const emailType = reminderType === '3_DAYS_BEFORE' ? 'THREE_DAYS' :
                        reminderType === '1_DAY_BEFORE' ? 'ONE_DAY' :
                        reminderType === 'DUE_DATE' ? 'DUE_DATE' : 'OVERDUE';
      
      await emailService.sendPaymentReminderEmail({
        to: studentEmail,
        studentName: `${student.firstName} ${student.secondName || ''}`.trim(),
        amount: Number(installment.amount || 0),
        currency: 'BHD',
        dueDate: installment.dueDate!,
        installmentNumber: installment.installmentNumber,
        reminderType: emailType as any
      });
      
      await logReminder(installment.id, reminderType, 'EMAIL');
    } catch (error) {
      console.error('Email send error:', error);
    }
  }
  
  // Send SMS to student
  if (studentPhone) {
    try {
      await smsService.sendSMS({
        to: studentPhone,
        message: smsMessage
      });
      
      await logReminder(installment.id, reminderType, 'SMS');
    } catch (error) {
      console.error('SMS send error:', error);
    }
  }
  
  // Send to parents
  for (const link of student.parentStudentLinks || []) {
    const parentEmail = link.parent.user.email;
    const parentPhone = link.parent.user.phone;
    
    if (parentEmail) {
      try {
        const emailType = reminderType === '3_DAYS_BEFORE' ? 'THREE_DAYS' :
                          reminderType === '1_DAY_BEFORE' ? 'ONE_DAY' :
                          reminderType === 'DUE_DATE' ? 'DUE_DATE' : 'OVERDUE';
        
        await emailService.sendPaymentReminderEmail({
          to: parentEmail,
          studentName: `${student.firstName} ${student.secondName || ''}`.trim(),
          amount: Number(installment.amount || 0),
          currency: 'BHD',
          dueDate: installment.dueDate!,
          installmentNumber: installment.installmentNumber,
          reminderType: emailType as any
        });
      } catch (error) {
        console.error('Parent email send error:', error);
      }
    }
    
    if (parentPhone) {
      try {
        await smsService.sendSMS({
          to: parentPhone,
          message: smsMessage
        });
      } catch (error) {
        console.error('Parent SMS send error:', error);
      }
    }
  }
}

function generateSMSMessage(
  amount: number,
  dueDate: Date,
  reminderType: string
): string {
  const amt = `BHD ${Number(amount).toFixed(2)}`;
  const date = dueDate.toLocaleDateString('en-GB');
  
  switch (reminderType) {
    case '3_DAYS_BEFORE':
      return `Payment ${amt} due in 3 days (${date}). Please pay on time. -Function Institute`;
    case '1_DAY_BEFORE':
      return `Payment ${amt} due TOMORROW (${date}). Please pay urgently. -Function Institute`;
    case 'DUE_DATE':
      return `Payment ${amt} due TODAY (${date}). Pay now to avoid late fees. -Function Institute`;
    case 'OVERDUE':
      return `URGENT: Payment ${amt} OVERDUE since ${date}. Contact office immediately. -Function Institute`;
    default:
      return `Payment reminder: ${amt} due ${date}. -Function Institute`;
  }
}

async function logReminder(
  installmentId: string,
  reminderType: string,
  sentVia: string
) {
  await prisma.paymentReminder.create({
    data: {
      installmentId,
      reminderType,
      sentAt: new Date(),
      sentVia
    }
  });
}

export const sendManualReminder = async (installmentId: string) => {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: {
      paymentPlan: {
        include: {
          enrollment: {
            include: {
              student: {
                include: {
                  user: true,
                  parentStudentLinks: {
                    include: {
                      parent: { include: { user: true } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (!installment) {
    throw new Error('Installment not found');
  }
  
  await sendPaymentReminder(installment, 'DUE_DATE');
};

export const getOverduePayments = async () => {
  const now = new Date();
  
  const installments = await prisma.installment.findMany({
    where: {
      paymentDate: null,
      dueDate: { lt: now, not: null }
    },
    include: {
      paymentPlan: {
        include: {
          enrollment: {
            include: {
              student: { include: { user: true } },
              group: { include: { level: true } }
            }
          }
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  });
  
  return installments.map(inst => ({
    installmentId: inst.id,
    studentName: `${inst.paymentPlan.enrollment.student.firstName} ${inst.paymentPlan.enrollment.student.secondName || ''}`.trim(),
    email: inst.paymentPlan.enrollment.student.user.email,
    phone: inst.paymentPlan.enrollment.student.user.phone,
    amount: Number(inst.amount),
    dueDate: inst.dueDate,
    daysOverdue: Math.floor((now.getTime() - inst.dueDate!.getTime()) / (1000 * 60 * 60 * 24)),
    level: inst.paymentPlan.enrollment.group?.level?.name || 'N/A'
  }));
};