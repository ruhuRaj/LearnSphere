import express from 'express';
import { protect } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_PUBLIC_KEY = process.env.AI_PUBLIC_KEY || null;

// Allow requests with a special public key header to bypass auth for public AI usage
const aiAccess = (req, res, next) => {
  const key = req.headers['x-ai-key'] || req.headers['x-ai-key'.toLowerCase()];
  if (AI_PUBLIC_KEY && key === AI_PUBLIC_KEY) return next();
  return protect(req, res, next);
};

// Proxy helper — forwards requests to FastAPI AI service
const proxyToAI = (endpoint) => async (req, res, next) => {
  try {
    const forwardHeaders = { 'Content-Type': 'application/json' };
    if (req.headers['x-ai-key']) forwardHeaders['x-ai-key'] = req.headers['x-ai-key'];

    const { data } = await axios.post(`${AI_URL}/ai/${endpoint}`, req.body, {
      headers: forwardHeaders,
      timeout: 60000,
    });
    res.json(data);
  } catch (error) {
    console.error("========== AI ERROR ==========");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", JSON.stringify(error.response?.data, null, 2));
    console.error("HEADERS:", error.response?.headers);
    console.error("URL:", `${AI_URL}/ai/${endpoint}`);
    console.error("==============================");

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.',
      });
    }

    const status = error.response?.status || 502;
    return res.status(status).json({
      success: false,
      message: error.response?.data?.detail || error.response?.data?.message || 'AI request failed.',
      details: error.response?.data,
    });
  }
};

router.post('/generate-test', aiAccess, proxyToAI('generate-test'));
router.post('/evaluate-mock-test', aiAccess, proxyToAI('evaluate-mock-test'));
router.post('/solve-doubt', aiAccess, proxyToAI('solve-doubt'));
router.post('/generate-content', aiAccess, proxyToAI('generate-content'));
router.post('/moderate-comment', aiAccess, proxyToAI('moderate-comment'));
router.post('/study-plan', aiAccess, proxyToAI('study-plan'));

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
