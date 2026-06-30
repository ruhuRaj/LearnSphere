import express from 'express';
import { protect } from '../middleware/auth.js';
import { saveMockTestAttempt, getMockTestAttempts } from '../controllers/mockTestController.js';

const router = express.Router();

router.post('/attempts', protect, saveMockTestAttempt);
router.get('/attempts', protect, getMockTestAttempts);

export default router;
