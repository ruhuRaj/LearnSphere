import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineLightningBolt, HiOutlineSparkles, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import api from '../../services/api';

export default function MockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | test | result
  const [activeTest, setActiveTest] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await api.get('/tests?limit=20');
        setTests(response?.data?.tests || []);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    if (view !== 'test' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const startTest = async (test) => {
    try {
      const response = await api.get(`/tests/${test._id}`);
      const testDetail = response?.data?.test || test;
      setActiveTest(testDetail);
      setCurrentQ(0);
      setAnswers({});
      setFlagged(new Set());
      setTimeLeft((testDetail.duration || 1) * 60);
      setResult(null);
      setView('test');
    } catch (error) {
      toast.error('Unable to load this test right now.');
      console.error(error);
    }
  };

  const submitTest = async () => {
    if (!activeTest?.questions?.length) return;

    const correct = activeTest.questions.reduce((count, question, index) => {
      const selectedOption = Number(answers[index]);
      const isCorrect = question.options?.some((option, optionIndex) => option.isCorrect && optionIndex === selectedOption) || false;
      return count + (isCorrect ? 1 : 0);
    }, 0);

    const score = Math.round((correct / activeTest.questions.length) * 100);
    const weakTopics = activeTest.questions
      .filter((question, index) => Number(answers[index]) !== undefined && !question.options?.[Number(answers[index])]?.isCorrect)
      .map((question) => question.topic)
      .filter(Boolean)
      .filter((topic, index, topics) => topics.indexOf(topic) === index);

    setResult({ score, correct, total: activeTest.questions.length, weakTopics: weakTopics.length ? weakTopics : ['Keep practicing to improve your score'] });
    setView('result');

    try {
      await api.post(`/tests/${activeTest._id}/submit`, {
        answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
          questionIndex: Number(questionIndex),
          selectedOption: Number(selectedOption),
        })),
        timeTaken: (activeTest.duration || 1) * 60 - timeLeft,
      });
    } catch (error) {
      console.error('Failed to submit test result:', error);
    }
  };

  const toggleFlag = () => {
    const next = new Set(flagged);
    if (next.has(currentQ)) next.delete(currentQ); else next.add(currentQ);
    setFlagged(next);
  };

  if (view === 'result') {
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 text-center max-w-lg w-full mx-4">
          <div className="text-6xl mb-4">{result.score >= 80 ? '🎉' : result.score >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-3xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Score: {result.score}%</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{result.correct}/{result.total} correct answers</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>{result.correct}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Correct</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--error)' }}>{result.total - result.correct}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Wrong</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{result.score}%</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Accuracy</div>
            </div>
          </div>
          {result.weakTopics.length > 0 && (
            <div className="mb-6 p-4 rounded-xl text-left" style={{ background: 'var(--bg-tertiary)' }}>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineSparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} /> AI Analysis — Weak Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.weakTopics.map((t) => <span key={t} className="badge badge-warning text-xs">{t}</span>)}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setView('list')} className="btn btn-secondary flex-1">Back to Tests</button>
            <button className="btn btn-primary flex-1">View Solutions</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'test') {
    const q = activeTest?.questions?.[currentQ];
    if (!q) return null;
    return (
      <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="glass-card p-4 flex items-center justify-between mb-6">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{activeTest?.title}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--error)' }}>
                <HiOutlineClock className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <button onClick={submitTest} className="btn btn-primary btn-sm">Submit</button>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="glass-card p-4 mb-6">
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Question Navigation</p>
            <div className="flex flex-wrap gap-2">
              {activeTest.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)} className="w-9 h-9 rounded-lg text-xs font-medium transition-all" style={{
                  background: currentQ === i ? 'var(--primary)' : answers[i] !== undefined ? 'rgba(16,185,129,0.2)' : flagged.has(i) ? 'rgba(245,158,11,0.2)' : 'var(--bg-tertiary)',
                  color: currentQ === i ? 'white' : answers[i] !== undefined ? 'var(--success)' : 'var(--text-secondary)',
                  border: flagged.has(i) ? '2px solid var(--accent)' : '2px solid transparent'
                }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question */}
          <motion.div key={currentQ} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="badge badge-primary">Question {currentQ + 1}/{activeTest.questions.length}</span>
              <button onClick={toggleFlag} className="btn btn-ghost btn-sm" style={{ color: flagged.has(currentQ) ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                {flagged.has(currentQ) ? '🚩 Flagged' : '🏳️ Flag'}
              </button>
            </div>
            <h3 className="text-lg font-medium mb-6" style={{ color: 'var(--text-primary)' }}>{q.text}</h3>
            <div className="space-y-3">
              {q.options?.map((opt, i) => (
                <button key={i} onClick={() => setAnswers({ ...answers, [currentQ]: i })} className="w-full text-left p-4 rounded-xl transition-all text-sm" style={{
                  background: answers[currentQ] === i ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                  border: answers[currentQ] === i ? '2px solid var(--primary)' : '2px solid transparent',
                  color: 'var(--text-primary)'
                }}>
                  <span className="font-medium mr-3" style={{ color: 'var(--text-tertiary)' }}>{String.fromCharCode(65 + i)}.</span>{opt.text || opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} className="btn btn-secondary" disabled={currentQ === 0}>
                <HiArrowLeft className="w-4 h-4" /> Previous
              </button>
              {currentQ === activeTest.questions.length - 1 ? (
                <button onClick={submitTest} className="btn btn-primary">Submit Test</button>
              ) : (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary">Next <HiArrowRight className="w-4 h-4" /></button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Test List View
  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>Mock Tests</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Practice with AI-generated and curated tests</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading available tests…</div>
          ) : tests.length ? (
            tests.map((test, i) => (
              <motion.div key={test._id || test.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="glass-card p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">📝</span>
                    <span className="badge text-xs" style={{
                      background: test.type === 'ai-generated' ? 'rgba(99,102,241,0.1)' : test.type === 'full' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: test.type === 'ai-generated' ? 'var(--primary)' : test.type === 'full' ? 'var(--error)' : 'var(--success)'
                    }}>{test.type === 'ai-generated' && <HiOutlineSparkles className="w-3 h-3 mr-1" />}{test.type || 'Test'}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2 font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{test.title}</h3>
                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                    <span>{Array.isArray(test.questions) ? test.questions.length : 0} Qs</span>
                    <span>{test.duration || 0} min</span>
                    <span className="badge text-[10px]" style={{
                      background: test.category === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: test.category === 'Hard' ? 'var(--error)' : 'var(--accent)'
                    }}>{test.category || 'Practice'}</span>
                  </div>
                  <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {test.attempted ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiOutlineCheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                          <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{test.score || 0}%</span>
                        </div>
                        <button onClick={() => startTest(test)} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>Retake</button>
                      </div>
                    ) : (
                      <button onClick={() => startTest(test)} className="btn btn-primary btn-sm w-full">
                        <HiOutlineLightningBolt className="w-4 h-4" /> Start Test
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>No tests are available right now.</div>
          )}
        </div>
      </div>
    </div>
  );
}
