import Course from '../models/Course.js';
import User from '../models/User.js';

const countLessonsFromChapters = (course) => {
  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];

  return chapters.reduce((sum, chapter) => {
    const topicCount = Array.isArray(chapter?.topics) ? chapter.topics.length : 0;
    const videoCount = Array.isArray(chapter?.videos) ? chapter.videos.length : 0;
    return sum + topicCount + videoCount;
  }, 0);
};

const normalizeCourseLessonCount = (course) => {
  const derivedLessons = countLessonsFromChapters(course);
  const lessonCount = derivedLessons > 0 ? derivedLessons : Number(course?.totalLessons || 0);

  return {
    ...course,
    totalLessons: lessonCount,
  };
};

// @desc    Get all courses (with filters)
// @route   GET /api/courses
export const getCourses = async (req, res) => {
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

  const normalizedCourses = courses.map((course) => normalizeCourseLessonCount(course.toObject ? course.toObject() : course));

  res.json({
    success: true,
    courses: normalizedCourses,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total,
  });
};

// @desc    Get single course
// @route   GET /api/courses/:id
export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio expertise');
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  res.json({ success: true, course: normalizeCourseLessonCount(course.toObject ? course.toObject() : course) });
};

// @desc    Get current student's enrolled courses
// @route   GET /api/courses/enrolled
export const getStudentEnrolledCourses = async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const courses = (user.enrolledCourses || [])
    .map((course) => normalizeCourseLessonCount(course.toObject ? course.toObject() : course))
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  res.json({ success: true, courses });
};

// @desc    Create course (teacher)
// @route   POST /api/courses
export const createCourse = async (req, res) => {
  const courseData = {
    ...req.body,
    teacher: req.user._id,
    totalLessons: normalizeCourseLessonCount({ ...req.body, totalLessons: req.body.totalLessons || 0 }).totalLessons,
  };

  const course = await Course.create(courseData);
  res.status(201).json({ success: true, course });
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updatedCourse = {
    ...course.toObject(),
    ...req.body,
    totalLessons: normalizeCourseLessonCount({
      ...course.toObject(),
      ...req.body,
      totalLessons: req.body.totalLessons ?? course.totalLessons,
    }).totalLessons,
  };

  course = await Course.findByIdAndUpdate(req.params.id, updatedCourse, { new: true, runValidators: true });
  res.json({ success: true, course });
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
export const enrollCourse = async (req, res) => {
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
};

// @desc    Approve course (admin)
// @route   PUT /api/courses/:id/approve
export const approveCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, isPublished: true },
    { new: true }
  );
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  res.json({ success: true, course, message: 'Course approved' });
};

// @desc    Get teacher's courses
// @route   GET /api/courses/my-courses
export const getMyCourses = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, courses });
};
