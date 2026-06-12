import { Test, TestResult } from '../models/Test.js';
import User from '../models/User.js';

// @desc    Get all tests (with filters)
// @route   GET /api/tests
export const getTests = async (req, res, next) => {
  try {
    const { course, type, category, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (course) query.course = course;
    if (type) query.type = type;
    if (category) query.category = category;

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
    res.json({ success: true, test });
  } catch (error) {
    next(error);
  }
};

// @desc    Create test (teacher)
// @route   POST /api/tests
export const createTest = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, test });
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
