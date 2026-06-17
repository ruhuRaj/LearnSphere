import express from 'express';
import { getDoubts, createDoubt, replyToDoubt, resolveDoubt } from '../controllers/doubtController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDoubts);
router.post('/', protect, authorize('student'), createDoubt);
router.post('/:id/reply', protect, authorize('teacher', 'admin'), replyToDoubt);
router.put('/:id/resolve', protect, resolveDoubt);

export default router;
