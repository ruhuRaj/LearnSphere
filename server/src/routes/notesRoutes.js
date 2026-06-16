import express from 'express';
import { getNotes, createNote } from '../controllers/noteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotes);
router.post('/', protect, authorize('teacher', 'admin'), createNote);

export default router;
