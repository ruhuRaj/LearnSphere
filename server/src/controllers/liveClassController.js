import LiveClass from '../models/LiveClass.js';
import { Attendance } from '../models/Other.js';
import User from '../models/User.js';

// @desc    Get live classes (with filters)
// @route   GET /api/live-classes
export const getLiveClasses = async (req, res, next) => {
  try {
    const { course, status, page = 1, limit = 12 } = req.query;
    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;
    if (req.user.role === 'teacher') query.teacher = req.user._id;

    const total = await LiveClass.countDocuments(query);
    const classes = await LiveClass.find(query)
      .populate('course', 'title')
      .populate('teacher', 'name avatar')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, classes, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Create live class (teacher)
// @route   POST /api/live-classes
export const createLiveClass = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const liveClass = await LiveClass.create(req.body);
    res.status(201).json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single live class
// @route   GET /api/live-classes/:id
export const getLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('course', 'title')
      .populate('teacher', 'name avatar bio');
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    res.json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Start live class
// @route   PUT /api/live-classes/:id/start
export const startLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    if (liveClass.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    liveClass.status = 'live';
    await liveClass.save();
    res.json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// @desc    End live class
// @route   PUT /api/live-classes/:id/end
export const endLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found' });
    liveClass.status = 'ended';
    if (req.body.recordingUrl) liveClass.recordingUrl = req.body.recordingUrl;
    await liveClass.save();
    res.json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance
// @route   POST /api/live-classes/:id/attendance
export const markAttendance = async (req, res, next) => {
  try {
    const existing = await Attendance.findOne({
      student: req.user._id,
      liveClass: req.params.id,
    });
    if (existing) return res.json({ success: true, message: 'Already marked' });

    await Attendance.create({
      student: req.user._id,
      liveClass: req.params.id,
      course: req.body.courseId,
      present: true,
      duration: req.body.duration || 0,
    });

    // Update attendee count
    const liveClass = await LiveClass.findById(req.params.id);
    if (liveClass) {
      liveClass.attendeeCount += 1;
      await liveClass.save();
    }

    // Award XP for attendance
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp += 10;
      await user.save();
    }

    res.json({ success: true, message: 'Attendance marked' });
  } catch (error) {
    next(error);
  }
};
