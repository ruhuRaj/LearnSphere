import express from 'express';
import { getThreads, getThread, createThread, addReply } from '../controllers/forumController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getThreads);
router.get('/:id', getThread);
router.post('/', createThread);
router.post('/:id/replies', addReply);

export default router;
