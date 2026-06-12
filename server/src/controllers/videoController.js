import Video from '../models/Video.js';
import Course from '../models/Course.js';
import { Comment } from '../models/Other.js';

// @desc    Get videos for a course
// @route   GET /api/videos/course/:courseId
export const getVideosByCourse = async (req, res, next) => {
  try {
    const videos = await Video.find({ course: req.params.courseId, isPublished: true })
      .sort({ order: 1 })
      .select('-publicId');
    res.json({ success: true, videos });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    video.views += 1;
    await video.save();
    res.json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/create video
// @route   POST /api/videos
export const createVideo = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const video = await Video.create(req.body);
    course.totalLessons += 1;
    await course.save();
    res.status(201).json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    await video.deleteOne();
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watch progress
// @route   PUT /api/videos/:id/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { watchedSeconds, totalSeconds } = req.body;
    const user = req.user;
    // Award XP for watching
    if (watchedSeconds > 60) {
      user.xp += 5;
      user.lastActive = new Date();
      await user.save();
    }
    res.json({ success: true, message: 'Progress updated', xpEarned: watchedSeconds > 60 ? 5 : 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a video
// @route   GET /api/videos/:id/comments
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ video: req.params.id, status: 'approved' })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Post comment on a video
// @route   POST /api/videos/:id/comments
export const postComment = async (req, res, next) => {
  try {
    const comment = await Comment.create({
      user: req.user._id,
      video: req.params.id,
      text: req.body.text,
      course: req.body.courseId,
    });
    const populated = await comment.populate('user', 'name avatar role');
    // Award XP for commenting
    req.user.xp += 2;
    await req.user.save();
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};
