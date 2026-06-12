import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all users (admin)
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status/role (admin)
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve teacher (admin)
// @route   PUT /api/admin/teachers/:id/approve
export const approveTeacher = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'teacher') return res.status(400).json({ success: false, message: 'User is not a teacher' });

    user.isApproved = true;
    user.status = 'active';
    await user.save();

    res.json({ success: true, user, message: 'Teacher approved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics (admin)
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
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
      { $match: { isPublished: true } },
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
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
