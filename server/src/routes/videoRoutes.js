import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getVideosByCourse, getVideo, createVideo, updateVideo,
  deleteVideo, updateProgress, getComments, postComment,
} from '../controllers/videoController.js';
import { protect, authorize } from '../middleware/auth.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // allow common video mime types
    if (!file.mimetype.startsWith('video/') && file.mimetype !== 'application/octet-stream') {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

const router = express.Router();

const handleFileUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Video file too large. Maximum size is 200MB.' : err.message || 'File upload failed';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

router.get('/course/:courseId', getVideosByCourse);
router.get('/:id', getVideo);
router.post('/', protect, authorize('teacher', 'admin'), handleFileUpload, createVideo);
router.put('/:id', protect, authorize('teacher', 'admin'), updateVideo);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteVideo);
router.put('/:id/progress', protect, updateProgress);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, postComment);

export default router;
