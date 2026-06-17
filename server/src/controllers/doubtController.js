import mongoose from 'mongoose';
import { Doubt } from '../models/Other.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get doubts (with filters)
// @route   GET /api/doubts
export const getDoubts = async (req, res, next) => {
  try {
    const { course, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;

    // Students see their own doubts, teachers see doubts for courses they teach
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      query.course = { $in: teacherCourses.map((course) => course._id) };
    }

    const total = await Doubt.countDocuments(query);
    const doubts = await Doubt.find(query)
      .populate('student', 'name avatar')
      .populate('course', 'title')
      .populate('replies.user', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, doubts, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a doubt
// @route   POST /api/doubts
export const createDoubt = async (req, res, next) => {
  try {
    const { course, question, topic, subject } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    if (course && !mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    if (course) {
      const exists = await Course.findById(course).select('_id');
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
    }

    const doubt = await Doubt.create({
      student: req.user._id,
      course: course || undefined,
      question: question.trim(),
      topic,
      subject,
    });

    const populated = await doubt.populate('student', 'name avatar');
    res.status(201).json({ success: true, doubt: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a doubt
// @route   POST /api/doubts/:id/reply
export const replyToDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id).populate('course', 'teacher');
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    if (req.user.role === 'teacher') {
      if (!doubt.course || String(doubt.course.teacher) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You are not authorized to reply to this doubt' });
      }
    }

    doubt.replies.push({
      user: req.user._id,
      text: req.body.text,
      role: req.body.isAI ? 'ai' : req.user.role,
    });
    doubt.status = 'answered';

    if (req.body.isAI) {
      doubt.aiResponse = req.body.text;
    }

    await doubt.save();
    const populated = await doubt.populate('replies.user', 'name avatar role');
    res.json({ success: true, doubt: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve doubt
// @route   PUT /api/doubts/:id/resolve
export const resolveDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    doubt.isResolved = true;
    doubt.status = 'resolved';
    await doubt.save();

    // Award XP for resolving
    const student = await User.findById(doubt.student);
    if (student) {
      student.xp += 5;
      await student.save();
    }

    res.json({ success: true, message: 'Doubt resolved' });
  } catch (error) {
    next(error);
  }
};
