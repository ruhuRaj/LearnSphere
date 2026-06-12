import express from 'express';
import {
  getTests, getTest, createTest, submitTest,
  getResults, getLeaderboard, getMyResults,
} from '../controllers/testController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTests);
router.get('/my-results', protect, getMyResults);
router.get('/:id', getTest);
router.post('/', protect, authorize('teacher', 'admin'), createTest);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/results', protect, getResults);
router.get('/:id/leaderboard', getLeaderboard);

export default router;
