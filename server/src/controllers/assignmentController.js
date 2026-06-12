import { Assignment } from '../models/Other.js';
import User from '../models/User.js';

// @desc    Get assignments (with filters)
// @route   GET /api/assignments
export const getAssignments = async (req, res, next) => {
  try {
    const { course, page = 1, limit = 20 } = req.query;
    const query = {};
    if (course) query.course = course;
    if (req.user.role === 'teacher') query.teacher = req.user._id;

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('course', 'title')
      .populate('teacher', 'name')
      .sort({ deadline: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, assignments, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('teacher', 'name')
      .populate('submissions.student', 'name avatar');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment (teacher)
// @route   POST /api/assignments
export const createAssignment = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment (student)
// @route   POST /api/assignments/:id/submit
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Check if already submitted
    const existing = assignment.submissions.find(
      (s) => s.student.toString() === req.user._id.toString()
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }

    // Check deadline
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ success: false, message: 'Deadline has passed' });
    }

    assignment.submissions.push({
      student: req.user._id,
      content: req.body.content,
      fileUrl: req.body.fileUrl || '',
    });
    await assignment.save();

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += 15;
    await user.save();

    res.json({ success: true, message: 'Assignment submitted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade assignment (teacher)
// @route   PUT /api/assignments/:id/grade/:studentId
export const gradeAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === req.params.studentId
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.score = req.body.score;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    await assignment.save();

    res.json({ success: true, message: 'Assignment graded' });
  } catch (error) {
    next(error);
  }
};
