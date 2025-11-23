// src/services/automated/scheduler.service.ts
import cron from 'node-cron';
import * as paymentReminderService from './paymentReminder.service';
import * as attendanceWarningService from './attendanceWarning.service';
import * as announcementService from '../announcement.service';

/**
 * Start all scheduled jobs
 */
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