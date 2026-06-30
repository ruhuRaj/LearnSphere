import axios from 'axios';
import { Scholarship, ScholarshipOTP } from '../models/Extra.js';
import { Test } from '../models/Test.js';
import crypto from 'crypto';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const generateFallbackScholarshipTest = (courseCategory) => {
  const questions = Array.from({ length: 25 }, (_, index) => ({
    text: `Question ${index + 1}: Which statement best describes a core concept in ${courseCategory}?`,
    type: 'mcq',
    options: [
      { text: `Concept A related to ${courseCategory}`, isCorrect: index % 4 === 0 },
      { text: `Concept B related to ${courseCategory}`, isCorrect: index % 4 === 1 },
      { text: `Concept C related to ${courseCategory}`, isCorrect: index % 4 === 2 },
      { text: `Concept D related to ${courseCategory}`, isCorrect: index % 4 === 3 },
    ],
    correctAnswer: String(index % 4),
    difficulty: 'Medium',
    topic: courseCategory,
    marks: 4,
  }));

  return {
    duration: 75,
    totalMarks: 100,
    questions,
  };
};

export const sendScholarshipOTP = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return ScholarshipOTP.create({ email: email.toLowerCase(), code, expiresAt, verified: false, used: false });
};

export const verifyScholarshipOTP = async (email, code) => {
  const otp = await ScholarshipOTP.findOne({
    email: email.toLowerCase(),
    code,
    verified: false,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (!otp) throw new Error('Invalid or expired OTP');
  otp.verified = true;
  otp.used = true;
  return otp.save();
};

export const fetchAIScholarshipTest = async (courseCategory) => {
  const payload = { topic: courseCategory, difficulty: 'Medium', num_questions: 25, category: courseCategory };

  try {
    const { data } = await axios.post(`${AI_URL}/ai/generate-test`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    if (!data?.test) {
      return generateFallbackScholarshipTest(courseCategory);
    }
    return data.test;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      console.warn('AI service unavailable, using fallback scholarship test.');
      return generateFallbackScholarshipTest(courseCategory);
    }
    throw error;
  }
};

export const createScholarshipTest = async (userId, studentInfo, testData) => {
  const test = await Test.create({
    title: `Scholarship Test — ${studentInfo.courseCategory}`,
    category: studentInfo.courseCategory,
    type: 'scholarship',
    duration: testData.duration || 100,
    totalMarks: testData.totalMarks || 100,
    questions: testData.questions,
    isAIGenerated: true,
    isPublished: true,
  });

  const scholarship = await Scholarship.create({
    student: userId,
    name: studentInfo.name,
    email: studentInfo.email.toLowerCase(),
    phone: studentInfo.phone,
    courseCategory: studentInfo.courseCategory,
    verifiedEmail: true,
    test: test._id,
    status: 'pending',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { scholarship, test };
};

export const evaluateScholarshipAnswers = ({ scholarship, answers }) => {
  const test = scholarship.test;
  let score = 0;
  const evaluatedAnswers = [];

  test.questions.forEach((question, index) => {
    const userAnswer = answers?.[index];
    let isCorrect = false;

    if (question.type === 'mcq') {
      isCorrect = question.options?.[userAnswer]?.isCorrect === true;
    } else if (question.type === 'true-false') {
      isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer || '').toLowerCase();
    } else if (question.type === 'fill-in-the-blank') {
      isCorrect = String(userAnswer || '').trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase();
    }

    if (isCorrect) score += question.marks || 4;
    evaluatedAnswers.push({ questionIndex: index, answer: userAnswer, isCorrect });
  });

  const percentage = Math.round((score / scholarship.test.totalMarks) * 100);
  let discountPercent = 10;
  if (percentage >= 90) discountPercent = 60;
  else if (percentage >= 80) discountPercent = 50;
  else if (percentage >= 70) discountPercent = 40;

  const couponCode = `SCH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  return { score, percentage, discountPercent, couponCode, evaluatedAnswers };
};
