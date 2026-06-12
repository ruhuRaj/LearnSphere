import { Doubt } from '../models/Other.js';
import User from '../models/User.js';

// @desc    Get doubts (with filters)
// @route   GET /api/doubts
export const getDoubts = async (req, res, next) => {
  try {
    const { course, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;

    // Students see own doubts, teachers see all for their courses
    if (req.user.role === 'student') {
      query.student = req.user._id;
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
    req.body.student = req.user._id;
    const doubt = await Doubt.create(req.body);
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
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

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
