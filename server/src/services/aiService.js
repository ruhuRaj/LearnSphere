/**
 * AI Service — Proxy calls to the Python FastAPI microservice
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Generic request to AI service
const callAI = async (endpoint, data) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `AI service responded with ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI service is unavailable. Please try again later.');
    }
    throw err;
  }
};

// Generate test questions
export const generateTest = async ({ subject, topic, difficulty, count, examType }) => {
  return callAI('/ai/generate-test', { subject, topic, difficulty, count, exam_type: examType });
};

// Solve a doubt
export const solveDoubt = async ({ question, subject, context }) => {
  return callAI('/ai/solve-doubt', { question, subject, context });
};

// Generate content (notes, quiz, flashcards, summary)
export const generateContent = async ({ topic, type, subject, level }) => {
  return callAI('/ai/generate-content', { topic, type, subject, level });
};

// Moderate a comment
export const moderateComment = async (comment) => {
  return callAI('/ai/moderate-comment', { comment });
};

// Generate study plan
export const generateStudyPlan = async ({ subjects, hoursPerDay, examDate, weakTopics }) => {
  return callAI('/ai/study-plan', { subjects, hours_per_day: hoursPerDay, exam_date: examDate, weak_topics: weakTopics });
};

// Get recommendations
export const getRecommendations = async (userId) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/recommend/${userId}`);
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Error('AI service is unavailable');
    }
    throw err;
  }
};

// Health check
export const checkAIHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, { method: 'GET' });
    return { status: response.ok ? 'healthy' : 'unhealthy', statusCode: response.status };
  } catch {
    return { status: 'unreachable', statusCode: 0 };
  }
};
