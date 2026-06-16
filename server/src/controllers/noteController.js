import Notes from '../models/Notes.js';
import Course from '../models/Course.js';

export const getNotes = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const enrolledCourseIds = req.user.enrolledCourses || [];
      query.course = { $in: enrolledCourseIds };
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }

    const notes = await Notes.find(query)
      .populate('course', 'title category teacher')
      .populate('teacher', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const note = await Notes.create({
      ...req.body,
      teacher: req.user._id,
      subject: req.body.subject || course.subject || course.category,
      type: req.body.type || 'markdown',
      isPublished: true,
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};
