import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import testRoutes from './routes/testRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import liveClassRoutes from './routes/liveClassRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/auth.js';

const app = express();

// ── Security & Parsing ──────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Auth requests are intentionally not rate limited.

// ── API Routes ──────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/ai', aiRoutes);

// ── Root API & Health Check ─────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LearnSphere API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      courses: '/api/courses',
      videos: '/api/videos',
      tests: '/api/tests',
      doubts: '/api/doubts',
      assignments: '/api/assignments',
      payments: '/api/payments',
      notifications: '/api/notifications',
      liveClasses: '/api/live-classes',
      forum: '/api/forum',
      ai: '/api/ai',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LearnSphere API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Error Handler (must be before 404 to catch async throws) ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log full error for debugging (message + stack)
  console.error('Error:', err && err.message);
  if (err && err.stack) console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
  }

  // Cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Resource not found' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

export default app;
