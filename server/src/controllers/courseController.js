import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get all courses (with filters)
// @route   GET /api/courses
export const getCourses = async (req, res, next) => {
  try {
    const { category, search, sort, difficulty, page = 1, limit = 12 } = req.query;

    const query = { isPublished: true, isApproved: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'popular': sortOption = { totalStudents: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'price-low': sortOption = { discountPrice: 1 }; break;
      case 'price-high': sortOption = { discountPrice: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('teacher', 'name avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio expertise');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course (teacher)
// @route   POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    req.body.teacher = req.user._id;
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
export const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }

    user.enrolledCourses.push(course._id);
    user.xp += 50; // XP for enrollment
    await user.save();

    course.totalStudents += 1;
    await course.save();

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve course (admin)
// @route   PUT /api/courses/:id/approve
export const approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isPublished: true },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course, message: 'Course approved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's courses
// @route   GET /api/courses/my-courses
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};
