/**
 * Course Service — Business logic for courses
 */
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get courses with filters, search, pagination
export const getCourses = async ({ category, subject, difficulty, search, page = 1, limit = 12 }) => {
  const query = { isPublished: true };

  if (category) query.category = category;
  if (subject) query.subject = subject;
  if (difficulty) query.difficulty = difficulty;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('teacher', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return {
    courses,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  };
};

// Get single course with full details
export const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('teacher', 'name avatar bio specialization')
    .populate('enrolledStudents', 'name avatar');

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  return course;
};

// Enroll student in a course
export const enrollStudent = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  if (course.enrolledStudents.includes(userId)) {
    const error = new Error('Already enrolled');
    error.statusCode = 400;
    throw error;
  }

  // Check if course is paid and payment not made (skip for free courses)
  if (course.price > 0) {
    // Payment verification would go here
  }

  course.enrolledStudents.push(userId);
  await course.save();

  // Award XP for enrollment
  const user = await User.findById(userId);
  if (user) {
    user.xp += 50;
    await user.save();
  }

  return course;
};

// Get teacher's courses
export const getTeacherCourses = async (teacherId) => {
  return Course.find({ teacher: teacherId })
    .sort({ createdAt: -1 })
    .lean();
};

// Get student's enrolled courses with progress
export const getEnrolledCourses = async (userId) => {
  return Course.find({ enrolledStudents: userId })
    .populate('teacher', 'name avatar')
    .sort({ updatedAt: -1 })
    .lean();
};
