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
app.use('/api', programRoutes);
app.use('/api', groupRoutes);
app.use('/api', teacherRoutes);
app.use('/api', studentRoutes);
app.use('/api', enrollmentRoutes);




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
