// src/services/automated/scheduler.service.ts
import cron from 'node-cron';
import * as paymentReminderService from './paymentReminder.service';
import * as attendanceWarningService from './attendanceWarning.service';
import * as announcementService from '../announcement.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
/**
 * Start all scheduled jobs
 */
/**
 * Check for missed speaking appointments
 * Runs every hour
 */
const checkMissedSpeakingAppointments = async () => {
  try {
    const now = new Date();
    
    console.log('🔍 Checking for missed speaking appointments...');
    
    // Find all SPEAKING_SCHEDULED test sessions
    const scheduledSessions = await prisma.testSession.findMany({
      where: {
        status: 'SPEAKING_SCHEDULED',
      },
      include: {
        speakingSlots: {
          where: {
            status: 'BOOKED'
          }
        }
      }
    });

    let missedCount = 0;

    for (const session of scheduledSessions) {
      if (!session.speakingSlots || session.speakingSlots.length === 0) continue;
      
      const slot = session.speakingSlots[0];
      
      // Combine date and time to check if appointment has passed
      const appointmentDateTime = new Date(slot.slotDate);
      const [hours, minutes] = slot.slotTime.toString().split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Add duration + 10 minute buffer
      appointmentDateTime.setMinutes(appointmentDateTime.getMinutes() + slot.durationMinutes + 10);
      
      // If appointment time + buffer has passed
      if (appointmentDateTime < now) {
        console.log(`⚠️ Missed appointment detected for session ${session.id}`);
        
        // Update speaking slot to MISSED
        await prisma.speakingSlot.update({
          where: { id: slot.id },
          data: { 
            status: 'MISSED',
            studentId: null,
            testSessionId: null
          }
        });
        
        // Revert test session to MCQ_COMPLETED
        await prisma.testSession.update({
          where: { id: session.id },
          data: { status: 'MCQ_COMPLETED' }
        });
        
        console.log(`✅ Session ${session.id} reverted to MCQ_COMPLETED`);
        missedCount++;
      }
    }
    
    if (missedCount > 0) {
      console.log(`✅ Processed ${missedCount} missed appointment(s)`);
    } else {
      console.log('✅ No missed appointments found');
    }
  } catch (error) {
    console.error('❌ Error checking missed appointments:', error);
  }
};
export const startScheduler = () => {
  console.log('🕒 Starting scheduler...');
  
  // Run payment reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running payment reminder check...');
    try {
      await paymentReminderService.checkAndSendReminders();
      console.log('✅ Payment reminders sent successfully');
    } catch (error) {
      console.error('❌ Payment reminder error:', error);
    }
  });
  
  // Run attendance warnings daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Running attendance warning check...');
    try {
      await attendanceWarningService.checkAndSendWarnings();
      console.log('✅ Attendance warnings sent successfully');
    } catch (error) {
      console.error('❌ Attendance warning error:', error);
    }
  });
  
  // Publish scheduled announcements every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Checking for scheduled announcements...');
    try {
      const count = await announcementService.publishScheduledAnnouncements();
      if (count > 0) {
        console.log(`✅ Published ${count} scheduled announcement(s)`);
      }
    } catch (error) {
      console.error('❌ Scheduled announcement error:', error);
    }
  });
  // ✅ ADD THIS: Check for missed appointments every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Checking for missed speaking appointments...');
    try {
      await checkMissedSpeakingAppointments();
    } catch (error) {
      console.error('❌ Missed appointment check error:', error);
    }
  });
  
  console.log('✅ Scheduler started');
  console.log('   - Payment reminders: Daily at 9:00 AM');
  console.log('   - Attendance warnings: Daily at 10:00 AM');
  console.log('   - Scheduled announcements: Every hour');
};

/**
 * Stop all scheduled jobs (for testing)
 */
export const stopScheduler = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 Scheduler stopped');
};