import express from 'express';
import {
  getVideosByCourse, getVideo, createVideo, updateVideo,
  deleteVideo, updateProgress, getComments, postComment,
} from '../controllers/videoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:courseId', getVideosByCourse);
router.get('/:id', getVideo);
router.post('/', protect, authorize('teacher', 'admin'), createVideo);
router.put('/:id', protect, authorize('teacher', 'admin'), updateVideo);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteVideo);
router.put('/:id/progress', protect, updateProgress);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, postComment);

export default router;
