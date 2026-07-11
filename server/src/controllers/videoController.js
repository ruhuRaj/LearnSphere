import fs from 'fs';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
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

      // Use Cloudinary's actual measured duration instead of trusting the client value
      if (uploadResult.duration) {
        videoData.duration = Math.round(uploadResult.duration);
      }

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
    const { watchedSeconds = 0, totalSeconds = 0 } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const courseId = video.course;
    const normalizedTotal = Number(totalSeconds) || Number(video.duration) || 0;
    const normalizedWatched = Math.min(Number(watchedSeconds) || 0, normalizedTotal || Number(watchedSeconds) || 0);
    const completionThreshold = normalizedTotal > 0 ? normalizedWatched / normalizedTotal >= 0.9 : normalizedWatched >= 30;
    const completed = Boolean(completionThreshold);

    // Deduplicate progress entries for the same video and merge any existing state.
    const mergedProgress = {};
    user.videoProgress.forEach((entry) => {
      const key = String(entry.video);
      if (!mergedProgress[key]) {
        mergedProgress[key] = { ...entry };
      } else {
        mergedProgress[key].watchedSeconds = Math.max(mergedProgress[key].watchedSeconds || 0, entry.watchedSeconds || 0);
        mergedProgress[key].totalSeconds = Math.max(mergedProgress[key].totalSeconds || 0, entry.totalSeconds || 0);
        mergedProgress[key].completed = mergedProgress[key].completed || entry.completed;
        mergedProgress[key].updatedAt = mergedProgress[key].updatedAt > entry.updatedAt ? mergedProgress[key].updatedAt : entry.updatedAt;
      }
    });
    user.videoProgress = Object.values(mergedProgress);

    const progressIndex = user.videoProgress.findIndex((entry) => String(entry.video) === String(video._id));
    let xpEarned = 0;
    if (progressIndex >= 0) {
      const existing = user.videoProgress[progressIndex];
      const wasCompleted = Boolean(existing.completed);
      existing.watchedSeconds = Math.max(existing.watchedSeconds, normalizedWatched);
      existing.totalSeconds = normalizedTotal || existing.totalSeconds;
      existing.completed = existing.completed || completed;
      existing.updatedAt = new Date();
      if (!wasCompleted && existing.completed) {
        xpEarned += 10;
      }
    } else {
      user.videoProgress.push({
        video: video._id,
        course: courseId,
        watchedSeconds: normalizedWatched,
        totalSeconds: normalizedTotal,
        completed,
        updatedAt: new Date(),
      });
      if (completed) xpEarned += 10;
    }

    if (xpEarned > 0) {
      user.xp += xpEarned;
      user.lastActive = new Date();
    }

    await user.save();

    const completedLessons = user.videoProgress.filter(
      (entry) => entry.completed && String(entry.course) === String(courseId)
    ).length;
    const totalLessons = await Video.countDocuments({ course: courseId, isPublished: true });

    res.json({
      success: true,
      completed: Boolean(completed),
      completedLessons,
      totalLessons,
      xpEarned,
    });
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