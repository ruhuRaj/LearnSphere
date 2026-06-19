import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, enrollCourse, approveCourse, getMyCourses,
  getStudentEnrolledCourses,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'course-thumbnails');
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
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for thumbnails'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleFileUpload = (req, res, next) => {
  upload.single('thumbnail')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Thumbnail too large. Maximum size is 5MB.' : err.message || 'File upload failed';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

const router = express.Router();

router.get('/', getCourses);
router.get('/enrolled', protect, authorize('student'), getStudentEnrolledCourses);
router.get('/my-courses', protect, authorize('teacher'), getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize('teacher', 'admin'), handleFileUpload, createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.put('/:id/approve', protect, authorize('admin'), approveCourse);

export default router;
