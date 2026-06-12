import express from 'express';
import { protect } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Proxy helper — forwards requests to FastAPI AI service
const proxyToAI = (endpoint) => async (req, res, next) => {
  try {
    const { data } = await axios.post(`${AI_URL}/ai/${endpoint}`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    res.json(data);
  } catch (error) {
    // If AI service is down, return a friendly fallback
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.',
      });
    }
    next(error);
  }
};

router.post('/generate-test', protect, proxyToAI('generate-test'));
router.post('/solve-doubt', protect, proxyToAI('solve-doubt'));
router.post('/generate-content', protect, proxyToAI('generate-content'));
router.post('/moderate-comment', protect, proxyToAI('moderate-comment'));
router.post('/study-plan', protect, proxyToAI('study-plan'));

// Recommendations (GET with user ID)
router.get('/recommend', protect, async (req, res, next) => {
  try {
    const { data } = await axios.get(`${AI_URL}/ai/recommend/${req.user._id}`, { timeout: 10000 });
    res.json(data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.json({
        success: true,
        recommendations: [
          { type: 'video', title: 'Review your recent topics', reason: 'AI service offline — showing defaults' },
          { type: 'test', title: 'Take a practice test', reason: 'Stay sharp with regular testing' },
        ],
      });
    }
    next(error);
  }
});

export default router;
