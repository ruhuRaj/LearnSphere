import express from 'express';
import {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, enrollCourse, approveCourse, getMyCourses,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/my-courses', protect, authorize('teacher'), getMyCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.put('/:id/approve', protect, authorize('admin'), approveCourse);

export default router;
