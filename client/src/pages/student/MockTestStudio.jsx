import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function MockTestStudio() {
  const [topics, setTopics] = useState('Physics, Kinematics');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const parsedTopics = useMemo(() => topics.split(',').map((topic) => topic.trim()).filter(Boolean), [topics]);
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get('/mock-tests/attempts');
        setHistory(data?.attempts || []);
      } catch (error) {
        console.error('Failed to load mock-test history:', error);
      }
    };

    loadHistory();
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!parsedTopics.length) {
      toast.error('Enter at least one topic name.');
      return;
    }

    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const { data } = await api.post('/ai/generate-test', {
        topic: parsedTopics.join(', '),
        difficulty,
        num_questions: Number(questionCount) || 5,
        category: 'student',
      });

      const generated = data?.questions || data?.test?.questions || [];
      if (!generated.length) {
        throw new Error('No questions were generated.');
      }

      setQuestions(generated);
      toast.success(`Generated ${generated.length} AI questions.`);
    } catch (error) {
      console.error('Failed to generate mock test:', error);
      toast.error(error.response?.data?.message || 'Could not generate a mock test right now.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!questions.length) return;

    setSubmitting(true);
    try {
      const payloadAnswers = questions.map((question, index) => ({
        questionId: question.id || index + 1,
        selectedOption: Number(answers[index] ?? -1),
      }));

      const { data } = await api.post('/ai/evaluate-mock-test', {
        topic: parsedTopics.join(', '),
        difficulty,
        questions,
        answers: payloadAnswers,
      });

      const evaluation = {
        score: Number(data?.score ?? 0),
        correct: Number(data?.correct ?? 0),
        total: Number(data?.total ?? questions.length),
        feedback: data?.feedback || 'You did well. Keep practicing to improve further.',
        strengths: data?.strengths || [],
        weaknesses: data?.weaknesses || [],
        tips: data?.tips || [],
      };

      setResult(evaluation);

      await api.post('/mock-tests/attempts', {
        attemptName: `${parsedTopics.join(', ')} mock test`,
        topics: parsedTopics,
        topic: parsedTopics.join(', '),
        difficulty,
        questions,
        answers: payloadAnswers,
        score: evaluation.score,
        correct: evaluation.correct,
        total: evaluation.total,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        tips: evaluation.tips,
        summary: {
          percentage: evaluation.score,
          remarks: evaluation.feedback,
        },
      });

      const { data: historyData } = await api.get('/mock-tests/attempts');
      setHistory(historyData?.attempts || []);
      toast.success('Your mock test has been evaluated by AI.');
    } catch (error) {
      console.error('Failed to evaluate mock test:', error);
      toast.error(error.response?.data?.message || 'Evaluation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container -mt-14" style={{ background: 'var(--bg-primary)', minHeight: '100%' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6" style={{ borderRadius: '20px' }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>AI Mock Test Studio</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter one or more topics, choose a difficulty, and let AI generate a short practice test for you.</p>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {parsedTopics.length ? `Topics: ${parsedTopics.join(', ')}` : 'Add topics to begin'}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.4fr_auto]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Topic names</label>
              <input
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
                placeholder="Physics, Kinematics, Waves"
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Difficulty</label>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="input w-full">
                {DIFFICULTIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-tertiary)' }}>Questions</label>
              <input
                type="number"
                min="3"
                max="10"
                value={questionCount}
                onChange={(event) => setQuestionCount(event.target.value)}
                className="input w-full"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary h-11 self-end">
              {loading ? 'Generating…' : 'Generate Test'}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6" style={{ borderRadius: '20px' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Saved history (upto 8 attempts history)</p>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent mock-test attempts</h3>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{history.length ? `${history.length} saved attempts` : 'No attempts yet'}</div>
          </div>

          {history.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {history.slice(0, 8).map((entry) => (
                <div key={entry._id} className="rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.topic}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{entry.difficulty} • {new Date(entry.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm font-bold mt-2" style={{ color: 'var(--primary)' }}>{entry.score}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your recent mock-test attempts will appear here after you complete one.</p>
          )}
        </motion.div>

        {!questions.length ? (
          <div className="glass-card p-8 text-center" style={{ borderRadius: '20px' }}>
            <div className="text-5xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No mock test generated yet</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create one from the form above and AI will generate questions and evaluate your answers instantly.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ borderRadius: '20px' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Practice session</p>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{parsedTopics.join(', ')}</h3>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{answeredCount}/{questions.length} answered</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="w-9 h-9 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: currentQuestionIndex === index ? 'var(--primary)' : answers[index] !== undefined ? 'rgba(16,185,129,0.2)' : 'var(--bg-tertiary)',
                      color: currentQuestionIndex === index ? '#fff' : answers[index] !== undefined ? 'var(--success)' : 'var(--text-secondary)',
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestion && (
                <>
                  <div className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <h4 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{currentQuestion.text}</h4>

                  <div className="space-y-3">
                    {(currentQuestion.options || []).map((option, optionIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text;
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                          className="w-full text-left p-4 rounded-xl transition-all text-sm"
                          style={{
                            background: answers[currentQuestionIndex] === optionIndex ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                            border: answers[currentQuestionIndex] === optionIndex ? '2px solid var(--primary)' : '2px solid transparent',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span className="font-medium mr-3" style={{ color: 'var(--text-tertiary)' }}>{String.fromCharCode(65 + optionIndex)}.</span>
                          {optionText}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-8 gap-3 flex-wrap">
                    <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} className="btn btn-secondary" disabled={currentQuestionIndex === 0}>
                      Previous
                    </button>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
                        {submitting ? 'Evaluating…' : 'Evaluate with AI'}
                      </button>
                    ) : (
                      <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="btn btn-primary">
                        Next
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6" style={{ borderRadius: '20px' }}>
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>AI feedback</p>
              {result ? (
                <div className="space-y-4">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{result.score}%</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{result.correct}/{result.total} correct answers</div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>AI summary</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.feedback}</p>
                  </div>

                  {result.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.strengths.map((item) => (
                          <span key={item} className="badge badge-success text-xs">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Focus areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.weaknesses.map((item) => (
                          <span key={item} className="badge badge-warning text-xs">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.tips?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Suggested next steps</h4>
                      <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {result.tips.map((tip) => <li key={tip}>• {tip}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Answer the questions and click “Evaluate with AI” to receive a score, feedback, and study tips.
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
