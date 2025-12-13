import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import programRoutes from './routes/program.routes';
import groupRoutes from './routes/group.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import termRoutes from './routes/term.routes';
import levelRoutes from './routes/level.routes';
import venueRoutes from './routes/venue.routes';
import hallRoutes from './routes/hall.routes';
import parentRoutes from './routes/parent.routes';
import phoneRoutes from './routes/phone.routes';
import sessionRoutes from './routes/session.routes';
import attendanceRoutes from './routes/attendance.routes';
import materialRoutes from './routes/material.routes';
import teacherScheduleRoutes from './routes/teacherSchedule.routes';
import speakingSlotRoutes from './routes/speakingSlots.routes';
import testRoutes from './routes/test.routes';
import testSessionRoutes from './routes/testSession.routes';
// import financialAnalyticsRoutes from './routes/financialAnalytics.routes';
// import programAnalyticsRoutes from './routes/programAnalytics.routes';
// import performanceReportsRoutes from './routes/performanceReports.routes';
// import dashboardAnalyticsRoutes from './routes/dashboardAnalytics.routes';
import reportingRoutes from './routes/reporting.routes';
import progressCriteriaRoutes from './routes/progressCriteria.routes';
import paymentRoutes from './routes/payment.routes';
import chatbotRoutes from './routes/chatbot.routes'
import notificationRoutes from './routes/notification.routes';
import * as scheduler from './services/notifications/scheduler.service';
import announcementRoutes from './routes/announcement.routes';
import smsRoutes from './routes/sms.routes';
import paymentReminderRoutes from './routes/paymentReminder.routes';
import attendanceWarningRoutes from './routes/attendanceWarning.routes';
import emailRoutes from './routes/email.routes';
import reportRoutes from './routes/report.routes';
import uploadsRoutes from './routes/uploads.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/teacher-schedules', teacherScheduleRoutes);
app.use('/api/speaking-slots', speakingSlotRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test-sessions', testSessionRoutes);
// app.use('/api/reports', financialAnalyticsRoutes);
// app.use('/api/reports', programAnalyticsRoutes);
// app.use('/api/reports', performanceReportsRoutes);
// app.use('/api/reports', dashboardAnalyticsRoutes);
app.use('/api/progress-criteria', progressCriteriaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/payment-reminders', paymentReminderRoutes);
app.use('/api/attendance-warnings', attendanceWarningRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/reports', reportRoutes);
app.use('/uploads', uploadsRoutes);  // Serve uploaded files

// scheduler.startScheduler(); // Disabled for testing - uncomment to enable automated reminders




// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Server Started Successfully!       ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Database: Connected                   ║
╠════════════════════════════════════════╣
║  📍 Endpoints:                          ║
║  GET  /api/health                      ║
║  POST /api/auth/request-otp            ║
║  POST /api/auth/verify-otp             ║
║  POST /api/auth/logout                 ║
║  GET  /api/auth/me                     ║
╚════════════════════════════════════════╝
  `);
});

export default app;
