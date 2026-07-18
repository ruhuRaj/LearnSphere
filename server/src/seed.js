/**
 * LearnSphere — Database Seed Script
 * Populates MongoDB with demo data for development/testing.
 * Run: npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import { Video, Notes } from './models/Video.js';
import { Test, Question } from './models/Test.js';
import { ForumThread } from './models/Extra.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learnsphere';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // ── Users ─────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@learnsphere.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    const teachers = await User.insertMany([
      { name: 'Dr. Rajesh Sharma', email: 'rajesh@learnsphere.com', password: hashedPassword, role: 'teacher', isVerified: true, isApproved: true, bio: 'IIT Delhi alumnus, 15+ years teaching JEE Physics', specialization: ['Physics'], xp: 8500 },
      { name: 'Prof. Meera Gupta', email: 'meera@learnsphere.com', password: hashedPassword, role: 'teacher', isVerified: true, isApproved: true, bio: 'AIIMS topper, expert in NEET Biology & Chemistry', specialization: ['Biology', 'Chemistry'], xp: 7200 },
      { name: 'Dr. Amit Verma', email: 'amit@learnsphere.com', password: hashedPassword, role: 'teacher', isVerified: true, isApproved: true, bio: 'Mathematics professor, IIT Bombay, competitive exam specialist', specialization: ['Mathematics'], xp: 9100 },
    ]);

    const students = await User.insertMany([
      { name: 'Aarav Sharma', email: 'aarav@test.com', password: hashedPassword, role: 'student', isVerified: true, targetExam: 'JEE', xp: 4500, streak: 12, level: 15 },
      { name: 'Priya Patel', email: 'priya@test.com', password: hashedPassword, role: 'student', isVerified: true, targetExam: 'NEET', xp: 3800, streak: 8, level: 12 },
      { name: 'Rahul Kumar', email: 'rahul@test.com', password: hashedPassword, role: 'student', isVerified: true, targetExam: 'JEE', xp: 5200, streak: 21, level: 18 },
      { name: 'Sneha Singh', email: 'sneha@test.com', password: hashedPassword, role: 'student', isVerified: true, targetExam: 'NEET', xp: 2100, streak: 5, level: 9 },
      { name: 'Arjun Reddy', email: 'arjun@test.com', password: hashedPassword, role: 'student', isVerified: true, targetExam: 'JEE', xp: 6100, streak: 30, level: 20 },
    ]);

    const parent = await User.create({
      name: 'Vikram Sharma',
      email: 'parent@test.com',
      password: hashedPassword,
      role: 'parent',
      isVerified: true,
      children: [students[0]._id],
    });

    console.log(` Created ${3 + 5 + 1 + 1} users (1 admin, 3 teachers, 5 students, 1 parent)`);

    // ── Courses ────────────────────────────────
    const courses = await Course.insertMany([
      {
        title: 'JEE Physics Complete Course',
        description: 'Master all Physics concepts for JEE Main & Advanced. Covers mechanics, thermodynamics, electromagnetism, optics, and modern physics with 500+ solved problems.',
        teacher: teachers[0]._id,
        category: 'JEE',
        subject: 'Physics',
        price: 4999,
        discountPrice: 2999,
        thumbnail: '',
        difficulty: 'Advanced',
        language: 'English',
        tags: ['JEE', 'Physics', 'IIT'],
        chapters: [
          { title: 'Mechanics', order: 1, description: 'Kinematics, Laws of Motion, Work-Energy Theorem' },
          { title: 'Thermodynamics', order: 2, description: 'Laws of Thermodynamics, Heat Transfer' },
          { title: 'Electromagnetism', order: 3, description: 'Electric Fields, Magnetic Fields, EMI' },
          { title: 'Optics', order: 4, description: 'Ray Optics, Wave Optics, Interference' },
          { title: 'Modern Physics', order: 5, description: 'Atomic Structure, Nuclear Physics, Semiconductors' },
        ],
        totalVideos: 120,
        totalDuration: 7200,
        isPublished: true,
        rating: 4.8,
        enrolledStudents: [students[0]._id, students[2]._id, students[4]._id],
      },
      {
        title: 'NEET Biology Mastery',
        description: 'Complete NEET Biology preparation covering Botany and Zoology with NCERT-aligned content, diagrams, and extensive MCQ practice.',
        teacher: teachers[1]._id,
        category: 'NEET',
        subject: 'Biology',
        price: 3999,
        discountPrice: 2499,
        thumbnail: '',
        difficulty: 'Intermediate',
        language: 'English',
        tags: ['NEET', 'Biology', 'Medical'],
        chapters: [
          { title: 'Cell Biology', order: 1, description: 'Cell Structure, Cell Division, Biomolecules' },
          { title: 'Genetics', order: 2, description: 'Mendel\'s Laws, Molecular Biology, DNA Replication' },
          { title: 'Human Physiology', order: 3, description: 'Digestion, Circulation, Respiration, Nervous System' },
          { title: 'Plant Biology', order: 4, description: 'Photosynthesis, Plant Anatomy, Plant Hormones' },
          { title: 'Ecology', order: 5, description: 'Ecosystems, Biodiversity, Environmental Issues' },
        ],
        totalVideos: 95,
        totalDuration: 5700,
        isPublished: true,
        rating: 4.6,
        enrolledStudents: [students[1]._id, students[3]._id],
      },
      {
        title: 'JEE Mathematics — Calculus & Algebra',
        description: 'Comprehensive JEE Mathematics preparation covering Calculus, Algebra, Coordinate Geometry, and Trigonometry with 300+ practice problems.',
        teacher: teachers[2]._id,
        category: 'JEE',
        subject: 'Mathematics',
        price: 4499,
        discountPrice: 2799,
        thumbnail: '',
        difficulty: 'Advanced',
        language: 'English',
        tags: ['JEE', 'Mathematics', 'Calculus'],
        chapters: [
          { title: 'Algebra', order: 1, description: 'Complex Numbers, Matrices, Sequences' },
          { title: 'Calculus', order: 2, description: 'Limits, Derivatives, Integration' },
          { title: 'Coordinate Geometry', order: 3, description: 'Lines, Circles, Conics' },
          { title: 'Trigonometry', order: 4, description: 'Identities, Equations, Properties' },
          { title: 'Probability & Statistics', order: 5, description: 'Permutations, Combinations, Probability' },
        ],
        totalVideos: 110,
        totalDuration: 6600,
        isPublished: true,
        rating: 4.9,
        enrolledStudents: [students[0]._id, students[2]._id, students[4]._id],
      },
      {
        title: 'NEET Chemistry Crash Course',
        description: 'Fast-paced NEET Chemistry preparation — Physical, Organic, and Inorganic Chemistry with shortcut tricks and formula sheets.',
        teacher: teachers[1]._id,
        category: 'NEET',
        subject: 'Chemistry',
        price: 2999,
        discountPrice: 1499,
        thumbnail: '',
        difficulty: 'Intermediate',
        language: 'Hindi',
        tags: ['NEET', 'Chemistry', 'Crash Course'],
        chapters: [
          { title: 'Physical Chemistry', order: 1, description: 'Atomic Structure, Chemical Bonding, Thermodynamics' },
          { title: 'Organic Chemistry', order: 2, description: 'GOC, Named Reactions, Mechanisms' },
          { title: 'Inorganic Chemistry', order: 3, description: 'Periodic Table, Coordination Chemistry, p-Block' },
        ],
        totalVideos: 60,
        totalDuration: 3600,
        isPublished: true,
        rating: 4.5,
        enrolledStudents: [students[1]._id, students[3]._id],
      },
      {
        title: 'CBSE Class 12 — Complete Package',
        description: 'Board exam preparation for all subjects with chapter-wise video lectures, notes, and solved past papers.',
        teacher: teachers[2]._id,
        category: 'Board Exam',
        subject: 'Mathematics',
        price: 0,
        discountPrice: 0,
        thumbnail: '',
        difficulty: 'Beginner',
        language: 'English',
        tags: ['CBSE', 'Class 12', 'Free'],
        chapters: [
          { title: 'Relations & Functions', order: 1 },
          { title: 'Matrices & Determinants', order: 2 },
          { title: 'Continuity & Differentiability', order: 3 },
        ],
        totalVideos: 75,
        totalDuration: 4500,
        isPublished: true,
        rating: 4.4,
        enrolledStudents: students.map(s => s._id),
      },
    ]);

    console.log(` Created ${courses.length} courses`);

    // ── Forum Threads ───────────────────────
    await ForumThread.deleteMany({});
    await ForumThread.insertMany([
      {
        title: 'How to approach Rotational Mechanics for JEE?',
        content: 'I am struggling with moment of inertia problems. Can anyone share their approach?',
        author: students[0]._id,
        category: 'doubt',
        tags: ['Physics', 'JEE'],
        upvotes: [students[1]._id, students[2]._id],
        views: 156,
        replies: [
          { author: teachers[0]._id, content: 'Start with understanding the axis theorem and practice symmetry-based problems.', upvotes: [students[0]._id], createdAt: new Date() },
        ],
        isPinned: true,
      },
      {
        title: 'Best resources for Organic Chemistry reactions?',
        content: 'Need recommendations for named reaction practice material.',
        author: students[1]._id,
        category: 'resource',
        tags: ['Chemistry', 'NEET'],
        upvotes: [students[3]._id],
        views: 203,
        replies: [],
      },
      {
        title: 'Study schedule for the last 3 months before JEE',
        content: 'Sharing a study plan that helped one of our students improve consistency.',
        author: students[4]._id,
        category: 'discussion',
        tags: ['JEE', 'Strategy'],
        upvotes: [students[0]._id, students[2]._id, students[3]._id],
        views: 512,
        replies: [],
      },
    ]);

    console.log(' Seeded forum threads');

    // ── Summary ───────────────────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('  🌟 LearnSphere Database Seeded!');
    console.log('═══════════════════════════════════════');
    console.log('\n📧 Login Credentials (password: password123):');
    console.log('  Admin:   admin@learnsphere.com');
    console.log('  Teacher: rajesh@learnsphere.com');
    console.log('  Student: aarav@test.com');
    console.log('  Parent:  parent@test.com');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error(' Seed failed:', error);
    process.exit(1);
  }
};

seedData();
