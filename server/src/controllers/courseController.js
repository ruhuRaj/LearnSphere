import fs from 'fs';
import path from 'path';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const countLessonsFromChapters = (course) => {
  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];

  return chapters.reduce((sum, chapter) => {
    const videoCount = Array.isArray(chapter?.videos) ? chapter.videos.length : 0;
    return sum + videoCount;
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

    const normalizedCourses = courses.map((course) => normalizeCourseLessonCount(course.toObject ? course.toObject() : course));

    res.json({
      success: true,
      courses: normalizedCourses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name avatar bio expertise');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    res.json({ success: true, course: normalizeCourseLessonCount(course.toObject ? course.toObject() : course) });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current student's enrolled courses
// @route   GET /api/courses/enrolled
export const getStudentEnrolledCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const completedMap = (user.videoProgress || [])
      .filter((entry) => entry.completed && entry.course)
      .reduce((map, entry) => {
        const courseKey = String(entry.course);
        const videoKey = String(entry.video);
        if (!map[courseKey]) map[courseKey] = new Set();
        map[courseKey].add(videoKey);
        return map;
      }, {});

    let courses = await Promise.all((user.enrolledCourses || []).map(async (course) => {
      const normalizedCourse = normalizeCourseLessonCount(course.toObject ? course.toObject() : course);
      const completedLessons = completedMap[String(normalizedCourse._id)] ? completedMap[String(normalizedCourse._id)].size : 0;
      const totalLessons = await Video.countDocuments({ course: normalizedCourse._id, isPublished: true });
      const progress = totalLessons ? Math.round((completedLessons / Math.max(1, totalLessons)) * 100) : 0;

      return {
        ...normalizedCourse,
        completedLessons,
        totalLessons,
        progress,
      };
    }));

    courses = courses.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Create course (teacher)
// @route   POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    // Validate required fields
    const { title, description, category, price } = req.body;
    if (!title?.trim()) throw new Error('Course title is required');
    if (!description?.trim()) throw new Error('Description is required');
    if (!category) throw new Error('Category is required');
    if (!price || price <= 0) throw new Error('Valid price is required');

    // Normalize language values (accept 'en'/'hi' or full names)
    const langRaw = req.body.language;
    const langMap = {
      en: 'English',
      hi: 'Hindi',
      english: 'English',
      hindi: 'Hindi',
      both: 'Both',
    };
    let language = undefined;
    if (langRaw !== undefined && langRaw !== null) {
      const key = String(langRaw).toLowerCase();
      language = langMap[key] || req.body.language;
    }

    const allowedLanguages = ['English', 'Hindi', 'Both'];
    if (language && !allowedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${req.body.language}`);
    }

    const courseData = {
      ...req.body,
      ...(language ? { language } : {}),
      teacher: req.user._id,
      totalLessons: normalizeCourseLessonCount({ ...req.body, totalLessons: req.body.totalLessons || 0 }).totalLessons,
    };
    // Log incoming payload to help diagnose 500 errors
    console.debug('createCourse payload:', {
      user: req.user?._id,
      body: req.body,
      normalizedLanguage: language,
    });

    // Ensure req.user exists
    if (!req.user || !req.user._id) {
      const err = new Error('Authentication error: user not found on request');
      err.statusCode = 401;
      throw err;
    }

    // Sanitize and coerce fields
    const sanitized = {
      title: String(req.body.title || '').trim(),
      description: String(req.body.description || '').trim(),
      category: req.body.category,
      difficulty: req.body.difficulty || 'Intermediate',
      price: Number(req.body.price) || 0,
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
      language: language || req.body.language,
      tags: Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t=>t.trim()).filter(Boolean) : []),
      chapters: Array.isArray(req.body.chapters) ? req.body.chapters.map((ch, i) => ({
        title: String(ch.title || '').trim(),
        order: ch.order ?? (i + 1),
        topics: Array.isArray(ch.topics) ? ch.topics : (typeof ch.topics === 'string' ? ch.topics.split(',').map(t => t.trim()).filter(Boolean) : []),
      })).filter(c => c.title) : [],
    };

    const finalCourseData = {
      ...courseData,
      ...sanitized,
    };

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: 'learn-sphere/course-thumbnails',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      finalCourseData.thumbnail = uploadResult.secure_url;
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.warn('Failed to remove thumbnail temp file:', unlinkErr.message);
      }
    }

    const course = await Course.create(finalCourseData);
    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
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

      // Normalize language in update payload if provided
      const langRaw = req.body.language;
      if (langRaw !== undefined && langRaw !== null) {
        const langMap = { en: 'English', hi: 'Hindi', english: 'English', hindi: 'Hindi', both: 'Both' };
        const key = String(langRaw).toLowerCase();
        const normalized = langMap[key] || req.body.language;
        const allowedLanguages = ['English', 'Hindi', 'Both'];
        if (!allowedLanguages.includes(normalized)) {
          return res.status(400).json({ success: false, message: `Unsupported language: ${req.body.language}` });
        }
        req.body.language = normalized;
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
};

// @desc    Get teacher's approved courses
// @route   GET /api/courses/my-courses
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ teacher: req.user._id, isApproved: true }).sort({ createdAt: -1 });

    const coursesWithCount = await Promise.all(courses.map(async (course) => {
      const actualLessons = await Video.countDocuments({ course: course._id, isPublished: true });
      return {
        ...course.toObject ? course.toObject() : course,
        totalLessons: actualLessons,
      };
    }));

    res.json({ success: true, courses: coursesWithCount });
  } catch (err) {
    next(err);
  }
};
