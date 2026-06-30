import crypto from 'crypto';
import { Scholarship, ScholarshipOTP } from '../models/Extra.js';
import { Test } from '../models/Test.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { fetchAIScholarshipTest } from '../services/scholarshipService.js';

const generateCouponCode = () => `SCH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export const sendScholarshipOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await ScholarshipOTP.create({ email, code, expiresAt, verified: false, used: false });

    await sendEmail({
      to: email,
      subject: 'Your LearnSphere Scholarship OTP',
      html: `Your OTP for the scholarship test is <strong>${code}</strong>. It expires in 10 minutes.`,
      text: `Your OTP for the scholarship test is ${code}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

export const verifyScholarshipOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and OTP code are required' });

    const otp = await ScholarshipOTP.findOne({
      email: email.toLowerCase(),
      code,
      verified: false,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    otp.verified = true;
    otp.used = true;
    await otp.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

const getVerifiedEmail = async (email) => {
  return await ScholarshipOTP.findOne({
    email: email.toLowerCase(),
    verified: true,
    used: true,
    expiresAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  }).sort({ createdAt: -1 });
};

export const createScholarshipApplication = async (req, res, next) => {
  try {
    const { name, email, phone, courseCategory } = req.body;
    if (!name || !email || !phone || !courseCategory) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const verifiedEmail = await getVerifiedEmail(email);
    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: 'Email must be verified before starting the scholarship test' });
    }

    const existing = await Scholarship.findOne({ email: email.toLowerCase(), status: { $in: ['pending', 'active'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A scholarship application for this email is already in progress' });
    }

    const testData = await fetchAIScholarshipTest(courseCategory);

    const test = await Test.create({
      title: `Scholarship Test — ${courseCategory}`,
      category: courseCategory,
      type: 'scholarship',
      duration: testData.duration || 75,
      totalMarks: testData.totalMarks || 100,
      questions: testData.questions,
      isAIGenerated: true,
      isPublished: true,
    });

    const scholarship = await Scholarship.create({
      student: req.user?._id,
      name,
      email: email.toLowerCase(),
      phone,
      courseCategory,
      verifiedEmail: true,
      test: test._id,
      status: 'pending',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      discountPercent: 0,
    });

    res.json({ success: true, scholarshipId: scholarship._id, test });
  } catch (error) {
    next(error);
  }
};

const evaluateAnswer = (q, userAnswer) => {
  if (q.type === 'mcq') {
    return q.options[userAnswer]?.isCorrect === true;
  }

  if (q.type === 'true-false') {
    return String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();
  }

  if (q.type === 'fill-in-the-blank') {
    return String(userAnswer || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
  }

  return false;
};

export const submitScholarshipTest = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const scholarship = await Scholarship.findById(req.params.id).populate('test');
    if (!scholarship || scholarship.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Scholarship test not found or already submitted' });
    }

    const test = scholarship.test;
    let score = 0;
    const evaluatedAnswers = [];

    test.questions.forEach((question, index) => {
      const userAnswer = answers?.[index];
      const isCorrect = evaluateAnswer(question, userAnswer);
      if (isCorrect) score += question.marks || 4;
      evaluatedAnswers.push({ questionIndex: index, userAnswer, isCorrect });
    });

    const percentage = Math.round((score / test.totalMarks) * 100);
    let discountPercent = 10;
    if (percentage >= 90) discountPercent = 60;
    else if (percentage >= 80) discountPercent = 50;
    else if (percentage >= 70) discountPercent = 40;

    const couponCode = generateCouponCode();
    scholarship.score = score;
    scholarship.percentage = percentage;
    scholarship.totalMarks = test.totalMarks;
    scholarship.discountPercent = discountPercent;
    scholarship.couponCode = couponCode;
    scholarship.status = 'active';
    scholarship.testAnswers = evaluatedAnswers;
    scholarship.timeTaken = timeTaken;
    scholarship.used = false;
    await scholarship.save();

    if (req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp += 30 + Math.floor(percentage / 5);
        await user.save();
      }
    }

    res.json({
      success: true,
      coupon: {
        code: couponCode,
        discountPercent,
        percentage,
        score,
        totalMarks: test.totalMarks,
      },
      message: `You scored ${percentage}%. Your coupon is active for one course purchase.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipStatus = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).populate('test');
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, scholarship });
  } catch (error) {
    next(error);
  }
};
