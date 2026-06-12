import express from 'express';
import {
  getAssignments, getAssignment, createAssignment,
  submitAssignment, gradeAssignment,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.put('/:id/grade/:studentId', protect, authorize('teacher', 'admin'), gradeAssignment);

export default router;
