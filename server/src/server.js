import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import User from './models/User.js';
import setupSockets from './sockets/socketHandler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Wire socket handler
setupSockets(io);

// Make io accessible to routes via app
app.set('io', io);

// Seed demo users
const seedDemoUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      await User.create([
        {
          name: 'Admin User', email: 'admin@demo.com', password: 'demo1234',
          role: 'admin', status: 'active', isApproved: true,
        },
        {
          name: 'Teacher Demo', email: 'teacher@demo.com', password: 'demo1234',
          role: 'teacher', status: 'active', isApproved: true,
          bio: 'Expert Physics teacher with 10+ years experience',
          expertise: ['Physics', 'JEE', 'NEET'],
        },
        {
          name: 'Student Demo', email: 'student@demo.com', password: 'demo1234',
          role: 'student', status: 'active',
          targetExam: 'JEE', xp: 2450, level: 12, streak: 7,
          badges: [
            { name: '7-Day Streak', icon: '🔥', earnedAt: new Date() },
            { name: 'Quiz Master', icon: '🏆', earnedAt: new Date() },
          ],
        },
      ]);
      console.log('✅ Demo users seeded');
    }
  } catch (error) {
    // Ignore if already exists
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedDemoUsers();

    httpServer.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🚀 LearnSphere API Server              ║
  ║   Running on port ${PORT}                  ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║                                           ║
  ║   API:  http://localhost:${PORT}/api       ║
  ║   Health: http://localhost:${PORT}/api/health ║
  ║   Socket.IO: ✅ Connected                 ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
