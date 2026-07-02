import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Test, TestResult } from '../models/Test.js';
import User from '../models/User.js';
import { generateTest as generateAITest } from '../services/aiService.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const buildFallbackQuestions = (topicName, description, count) => {
  const safeCount = Math.max(1, Number(count || 5));
  return Array.from({ length: safeCount }, (_, index) => ({
    id: index + 1,
    text: `Q${index + 1}: ${topicName || 'Topic'} — ${description || 'Practice this concept thoroughly.'}`,
    type: 'mcq',
    options: [
      { text: 'Option A', isCorrect: index % 4 === 0 },
      { text: 'Option B', isCorrect: index % 4 === 1 },
      { text: 'Option C', isCorrect: index % 4 === 2 },
      { text: 'Option D', isCorrect: index % 4 === 3 },
    ],
    correctAnswer: String(index % 4),
    explanation: 'This question was generated locally because the AI service was unavailable.',
    difficulty: index % 2 === 0 ? 'Easy' : 'Medium',
    topic: topicName || 'General',
    marks: 4,
  }));
};

const buildQuestionsFromAI = async ({ topicName, description, questionCount, marks, title }) => {
  const safeCount = Math.max(1, Number(questionCount || 5));
  const safeMarks = Math.max(1, Number(marks || safeCount * 4));
  const promptTopic = `${topicName || title || 'Topic'}\nDescription: ${description || 'Practice this topic thoroughly.'}`;

  try {
    const aiResponse = await generateAITest({
      subject: title || topicName || 'Topic',
      topic: promptTopic,
      difficulty: 'Medium',
      count: safeCount,
      examType: 'topic',
    });

    const generatedQuestions = aiResponse?.test?.questions || aiResponse?.questions || [];
    if (Array.isArray(generatedQuestions) && generatedQuestions.length) {
      return generatedQuestions.map((question, index) => ({
        ...question,
        id: question.id || index + 1,
        text: question.text || `Q${index + 1}: ${topicName || 'Topic'}`,
        topic: question.topic || topicName || 'General',
        marks: Number(question.marks || Math.max(1, Math.round(safeMarks / safeCount))),
        difficulty: question.difficulty || 'Medium',
      }));
    }
  } catch (error) {
    console.warn('AI generation failed, using fallback questions:', error.message);
  }

  return buildFallbackQuestions(topicName, description, safeCount);
};

// @desc    Get all tests (with filters)
// @route   GET /api/tests
export const getTests = async (req, res, next) => {
  try {
    const { course, type, category, page = 1, limit = 12, teacher } = req.query;
    const query = { isPublished: true };
    if (course) query.course = course;
    if (type) query.type = type;
    if (category) query.category = category;
    if (teacher) query.teacher = teacher;

    const total = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .populate('course', 'title')
      .populate('teacher', 'name')
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, tests, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test details (with questions for taking)
// @route   GET /api/tests/:id
export const getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('course', 'title')
      .populate('teacher', 'name');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const safeTest = test.toObject ? test.toObject() : test;
    if (safeTest.isPdfUpload) {
      safeTest.questions = [];
      safeTest.allowAttempts = false;
    } else {
      safeTest.questions = (safeTest.questions || []).map((question) => {
        const { correctAnswer, explanation, ...rest } = question;
        return rest;
      });
    }

    res.json({ success: true, test: safeTest });
  } catch (error) {
    next(error);
  }
};

// @desc    Create test (teacher)
// @route   POST /api/tests
export const createTest = async (req, res, next) => {
  try {
    const { title, course, topicName, description, duration, questionCount, marks, type } = req.body;
    if (!title || !course || !topicName || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title, course, topic name, and description.' });
    }

    const safeQuestionCount = Math.max(1, Number(questionCount || 5));
    const safeDuration = Math.max(5, Number(duration || safeQuestionCount * 3));
    const safeMarks = Math.max(1, Number(marks || safeQuestionCount * 4));

    let test;
    if (req.file) {
      let uploadResult;
      try {
        uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw',
          folder: 'learn-sphere/tests',
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        });
      } catch (uploadError) {
        console.error('Cloudinary test upload failed:', uploadError.message);
        return res.status(500).json({ success: false, message: 'Failed to upload PDF question paper to Cloudinary.' });
      } finally {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.warn('Failed to remove temporary test upload file:', cleanupError.message);
          }
        }
      }

      test = await Test.create({
        title,
        course,
        teacher: req.user._id,
        type: 'pdf-upload',
        duration: safeDuration,
        totalMarks: safeMarks,
        questionCount: safeQuestionCount,
        marksPerQuestion: Math.max(1, Math.round(safeMarks / safeQuestionCount)),
        topicName,
        description,
        aiPrompt: `${topicName}\n${description}`,
        questions: [],
        isAIGenerated: false,
        isPdfUpload: true,
        allowAttempts: false,
        pdfUrl: uploadResult.secure_url,
        pdfPublicId: uploadResult.public_id,
        pdfFileName: req.file.originalname,
        isPublished: true,
      });
    } else {
      const generatedQuestions = await buildQuestionsFromAI({
        topicName,
        description,
        questionCount: safeQuestionCount,
        marks: safeMarks,
        title,
      });

      test = await Test.create({
        title,
        course,
        teacher: req.user._id,
        type: type || 'ai-generated',
        duration: safeDuration,
        totalMarks: safeMarks,
        questionCount: safeQuestionCount,
        marksPerQuestion: Math.max(1, Math.round(safeMarks / safeQuestionCount)),
        topicName,
        description,
        aiPrompt: `${topicName}\n${description}`,
        questions: generatedQuestions,
        isAIGenerated: true,
        isPdfUpload: false,
        allowAttempts: true,
        isPublished: true,
      });
    }

    res.status(201).json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's created tests
// @route   GET /api/tests/my-tests
export const getMyTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ teacher: req.user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit test answers
// @route   POST /api/tests/:id/submit
export const submitTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    if (test.isPdfUpload || test.allowAttempts === false) {
      return res.status(403).json({ success: false, message: 'This test is view-only and cannot be attempted.' });
    }

    const { answers, timeTaken } = req.body;
    let score = 0;
    const weakTopics = [];
    const evaluatedAnswers = [];

    test.questions.forEach((q, i) => {
      const userAnswer = answers[i];
      let isCorrect = false;
      if (q.type === 'mcq' && userAnswer !== undefined) {
        isCorrect = q.options[userAnswer]?.isCorrect === true;
      }
      if (isCorrect) {
        score += q.marks;
      } else if (userAnswer !== undefined && userAnswer !== -1) {
        score -= q.negativeMarks || 0;
        if (q.topic && !weakTopics.includes(q.topic)) weakTopics.push(q.topic);
      }
      evaluatedAnswers.push({ questionIndex: i, selectedOption: userAnswer, isCorrect });
    });

    score = Math.max(0, score);
    const percentage = Math.round((score / test.totalMarks) * 100);

    const result = await TestResult.create({
      test: test._id,
      student: req.user._id,
      answers: evaluatedAnswers,
      score,
      percentage,
      timeTaken,
      weakTopics,
      aiAnalysis: `You scored ${percentage}%. ${weakTopics.length > 0 ? `Focus on: ${weakTopics.join(', ')}` : 'Great job!'}`,
    });

    // Update test stats
    test.totalAttempts += 1;
    test.avgScore = Math.round(((test.avgScore * (test.totalAttempts - 1)) + percentage) / test.totalAttempts);
    await test.save();

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += 20 + Math.floor(percentage / 10);
    await user.save();

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test results for a student
// @route   GET /api/tests/:id/results
export const getResults = async (req, res, next) => {
  try {
    const result = await TestResult.findOne({ test: req.params.id, student: req.user._id })
      .populate('test');
    if (!result) return res.status(404).json({ success: false, message: 'No results found' });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard for a test
// @route   GET /api/tests/:id/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const results = await TestResult.find({ test: req.params.id })
      .populate('student', 'name avatar level')
      .sort({ score: -1, timeTaken: 1 })
      .limit(50);
    res.json({ success: true, leaderboard: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's all test results
// @route   GET /api/tests/my-results
export const getMyResults = async (req, res, next) => {
  try {
    const results = await TestResult.find({ student: req.user._id })
      .populate('test', 'title type category duration')
      .sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
