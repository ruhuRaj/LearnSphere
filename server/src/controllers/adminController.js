import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all users (admin)
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role && role !== 'all') query.role = role;
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, users, total, totalPages: Math.ceil(total / limit) });
};

// @desc    Update user status/role/approval (admin)
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  const { status, role, isApproved, rejected, rejectReason } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (role) updates.role = role;
  if (isApproved !== undefined) updates.isApproved = isApproved;
  if (rejected !== undefined) updates.rejected = rejected;
  if (rejectReason !== undefined) updates.rejectReason = rejectReason;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user });
};

// @desc    Get platform settings (admin)
// @route   GET /api/admin/settings
const platformSettings = {
  siteName: 'LearnSphere',
  siteTagline: 'AI-Powered Learning Platform',
  maintenanceMode: false,
  registrationOpen: true,
  teacherAutoApprove: false,
  maxFileSize: 50,
  defaultLanguage: 'en',
  enableAI: true,
  razorpayEnabled: true,
  stripeEnabled: false,
  freeTrial: true,
  freeTrialDays: 7,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  fromEmail: 'noreply@learnsphere.com',
  maxStudentsPerCourse: 500,
  enableGamification: true,
  enableForum: true,
};

export const getSettings = async (req, res) => {
  res.json({ success: true, settings: platformSettings });
};

// @desc    Update platform settings (admin)
// @route   PUT /api/admin/settings
export const updateSettings = async (req, res) => {
  Object.assign(platformSettings, req.body);
  res.json({ success: true, settings: platformSettings });
};

// @desc    Approve teacher (admin)
// @route   PUT /api/admin/teachers/:id/approve
export const approveTeacher = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role !== 'teacher') return res.status(400).json({ success: false, message: 'User is not a teacher' });

  user.isApproved = true;
  user.status = 'active';
  await user.save();

  res.json({ success: true, user, message: 'Teacher approved' });
};

// @desc    Get platform analytics (admin)
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const pendingTeachers = await User.countDocuments({ role: 'teacher', status: 'pending' });
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true, isApproved: true });
  const pendingCourses = await Course.countDocuments({ isApproved: false });

  // User growth by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Course category distribution
  const categoryDist = await Course.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, students: { $sum: '$totalStudents' } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers, totalStudents, totalTeachers, pendingTeachers,
      totalCourses, publishedCourses, pendingCourses,
      userGrowth, categoryDist,
    },
  });
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
};

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
export const getCourses = async (req, res) => {
  const { search, status, category, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status === 'pending') {
    query.isApproved = false;
    query.isHeld = false;
  } else if (status === 'approved') {
    query.isApproved = true;
  } else if (status === 'hold') {
    query.isHeld = true;
  }
  if (category && category !== 'all') query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('teacher', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, courses, total, totalPages: Math.ceil(total / limit) });
};

// @desc    Approve or reject a course (admin)
// @route   PUT /api/admin/courses/:id/status
export const updateCourseStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (status === 'approved') {
    course.isApproved = true;
    course.isPublished = true;
    course.isHeld = false;
  } else if (status === 'rejected') {
    course.isApproved = false;
    course.isPublished = false;
    course.isHeld = false;
  } else if (status === 'hold') {
    course.isApproved = false;
    course.isPublished = false;
    course.isHeld = true;
  }
  await course.save();

  res.json({ success: true, course, message: `Course ${status}` });
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
export const deleteCourseAdmin = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
};
