import MockTestAttempt from '../models/MockTestAttempt.js';

export const saveMockTestAttempt = async (req, res, next) => {
  try {
    const {
      attemptName,
      topics,
      topic,
      difficulty,
      questions,
      answers,
      score,
      correct,
      total,
      feedback,
      strengths,
      weaknesses,
      tips,
      summary,
    } = req.body;

    const studentId = String(req.user?.id || req.user?._id || req.user?.userId || '').trim();

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Missing student identity for mock-test history.' });
    }

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((question, index) => ({
          id: question.id || index + 1,
          text: question.text || question.prompt || `Question ${index + 1}`,
          type: question.type || 'mcq',
          options: Array.isArray(question.options) ? question.options.map((option) => ({
            text: typeof option === 'string' ? option : option.text || '',
            isCorrect: Boolean(option.isCorrect),
          })) : [],
          difficulty: question.difficulty || difficulty || 'Medium',
          topic: question.topic || topic || '',
          marks: Number(question.marks || 1),
          explanation: question.explanation || '',
        }))
      : [];

    const normalizedAnswers = Array.isArray(answers)
      ? answers.map((answer) => ({
          questionId: Number(answer.questionId || 0),
          selectedOption: Number(answer.selectedOption ?? -1),
          correct: Boolean(answer.correct || false),
          answerText: answer.answerText || '',
        }))
      : [];

    const attempt = await MockTestAttempt.create({
      student: req.user?._id,
      studentId,
      studentEmail: req.user?.email || '',
      attemptName: attemptName || (topic ? `${topic} mock test` : 'Mock Test Attempt'),
      topics: Array.isArray(topics) ? topics : topic ? topic.split(',').map((t) => t.trim()).filter(Boolean) : [],
      topic: topic || 'General',
      difficulty: difficulty || 'Medium',
      questions: normalizedQuestions,
      answers: normalizedAnswers,
      score: Number(score || 0),
      correct: Number(correct || 0),
      total: Number(total || normalizedQuestions.length || 0),
      feedback: feedback || 'Practice completed.',
      strengths: Array.isArray(strengths) ? strengths : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      tips: Array.isArray(tips) ? tips : [],
      summary: {
        percentage: Number(summary?.percentage ?? score ?? 0),
        remarks: String(summary?.remarks || feedback || 'Practice completed.'),
      },
    });

    const dbName = MockTestAttempt.db?.databaseName || 'unknown';
    const collectionName = MockTestAttempt.collection?.collectionName || 'mocktestattempts';

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(201).json({ success: true, attempt, dbName, collectionName });
  } catch (error) {
    next(error);
  }
};

export const getMockTestAttempts = async (req, res, next) => {
  try {
    const studentId = String(req.user?.id || req.user?._id || req.user?.userId || '').trim();
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Missing student identity for mock-test history.' });
    }

    const attempts = await MockTestAttempt.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const dbName = MockTestAttempt.db?.databaseName || 'unknown';
    const collectionName = MockTestAttempt.collection?.collectionName || 'mocktestattempts';

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ success: true, attempts, dbName, collectionName, count: attempts.length });
  } catch (error) {
    next(error);
  }
};
