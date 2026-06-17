import fs from 'fs';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import { Comment } from '../models/Other.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const videoData = {
      title: req.body.title,
      course: req.body.course,
      chapter: req.body.chapter,
      duration: req.body.duration || 0,
      description: req.body.description || '',
      order: req.body.order || 0,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    };

    // If a file was uploaded, push it to Cloudinary (video resource)
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'learn-sphere/videos',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      videoData.url = uploadResult.secure_url;
      videoData.publicId = uploadResult.public_id;

      // remove temp file
      try { fs.unlinkSync(req.file.path); } catch (e) { console.warn('Failed to remove temp video file:', e.message); }
    } else if (req.body.url) {
      videoData.url = req.body.url;
    }

    const video = await Video.create(videoData);
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
    // remove from Cloudinary if present
    if (video.publicId) {
      try {
        await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
      } catch (err) {
        console.warn('Cloudinary delete failed for video:', err.message);
      }
    }

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
