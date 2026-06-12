/**
 * Certificate Service — Generate and verify certificates
 */
import crypto from 'crypto';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Generate a unique certificate ID
const generateCertificateId = () => {
  const prefix = 'LS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Check if student is eligible for certificate
export const checkEligibility = async (userId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const isEnrolled = course.enrolledStudents.includes(userId);
  if (!isEnrolled) {
    return { eligible: false, reason: 'Not enrolled in this course' };
  }

  // In production, check actual video/chapter completion progress
  // For now, consider eligible if enrolled
  return {
    eligible: true,
    course: { id: course._id, title: course.title },
  };
};

// Generate certificate data
export const generateCertificate = async (userId, courseId) => {
  const eligibility = await checkEligibility(userId, courseId);
  if (!eligibility.eligible) {
    const error = new Error(eligibility.reason);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  const course = await Course.findById(courseId).populate('teacher', 'name');

  const certificate = {
    certificateId: generateCertificateId(),
    studentName: user.name,
    courseName: course.title,
    teacherName: course.teacher?.name || 'LearnSphere Instructor',
    issueDate: new Date().toISOString(),
    category: course.category,
    duration: `${Math.round(course.totalDuration / 60)} hours`,
    verificationUrl: `${process.env.CLIENT_URL || 'https://learnsphere.com'}/verify`,
    grade: 'Pass with Distinction', // In production, calculate from test scores
  };

  return certificate;
};

// Verify certificate by ID
export const verifyCertificate = async (certificateId) => {
  // In production, look up from a certificates collection
  // For now, just validate the format
  const isValid = /^LS-[A-Z0-9]+-[A-Z0-9]+$/.test(certificateId);

  return {
    valid: isValid,
    certificateId,
    message: isValid ? 'This is a valid LearnSphere certificate' : 'Invalid certificate ID',
  };
};
