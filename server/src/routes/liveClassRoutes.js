import express from 'express';
import {
  getLiveClasses, createLiveClass, getLiveClass,
  startLiveClass, endLiveClass, markAttendance,
} from '../controllers/liveClassController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getLiveClasses);
router.get('/:id', protect, getLiveClass);
router.post('/', protect, authorize('teacher'), createLiveClass);
router.put('/:id/start', protect, authorize('teacher'), startLiveClass);
router.put('/:id/end', protect, authorize('teacher'), endLiveClass);
router.post('/:id/attendance', protect, markAttendance);

export default router;
