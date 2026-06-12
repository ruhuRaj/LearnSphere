import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiOutlineAcademicCap, HiOutlineClock, HiOutlineCheckCircle, HiOutlineSparkles, HiArrowRight } from 'react-icons/hi';

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>{children}</motion.div>;
}

const tiers = [
  { score: '90%+', discount: '70%', color: '#10b981', label: 'Platinum' },
  { score: '80%+', discount: '50%', color: '#6366f1', label: 'Gold' },
  { score: '70%+', discount: '30%', color: '#f59e0b', label: 'Silver' },
  { score: '60%+', discount: '15%', color: '#06b6d4', label: 'Bronze' },
];

const sampleQuestions = [
  { q: 'A body of mass 5 kg is thrown vertically upward with a velocity of 20 m/s. What is the kinetic energy at the highest point?', options: ['0 J', '500 J', '1000 J', '250 J'], correct: 0 },
  { q: 'The SI unit of electric charge is:', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], correct: 2 },
  { q: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correct: 2 },
];

export default function Scholarship() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (idx) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const handleNext = () => {
    if (currentQ < sampleQuestions.length - 1) setCurrentQ(currentQ + 1);
  };

  const handleSubmit = () => {
    let s = 0;
    sampleQuestions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
    setScore(Math.round((s / sampleQuestions.length) * 100));
    setSubmitted(true);
  };

  const getDiscount = () => {
    if (score >= 90) return { discount: '70%', tier: 'Platinum', color: '#10b981' };
    if (score >= 80) return { discount: '50%', tier: 'Gold', color: '#6366f1' };
    if (score >= 70) return { discount: '30%', tier: 'Silver', color: '#f59e0b' };
    if (score >= 60) return { discount: '15%', tier: 'Bronze', color: '#06b6d4' };
    return { discount: '0%', tier: 'Keep trying!', color: 'var(--text-tertiary)' };
  };

  if (submitted) {
    const d = getDiscount();
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Your Score: {score}%</h2>
          <div className="text-4xl font-extrabold font-[Outfit] my-4" style={{ color: d.color }}>{d.discount} Scholarship!</div>
          <p className="badge mb-6" style={{ background: `${d.color}20`, color: d.color }}>{d.tier} Tier</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Congratulations! Your scholarship discount has been applied to your account.</p>
          <a href="/courses" className="btn btn-primary btn-lg">Browse Courses</a>
        </motion.div>
      </div>
    );
  }

  if (started) {
    const q = sampleQuestions[currentQ];
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
        <div className="w-full max-w-2xl mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Question {currentQ + 1}/{sampleQuestions.length}</span>
            <div className="flex gap-1.5">{sampleQuestions.map((_, i) => (<div key={i} className="w-8 h-1.5 rounded-full" style={{ background: i <= currentQ ? 'var(--primary)' : 'var(--bg-tertiary)' }} />))}</div>
          </div>

          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{q.q}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-4 rounded-xl transition-all text-sm font-medium" style={{ background: answers[currentQ] === i ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)', border: answers[currentQ] === i ? '2px solid var(--primary)' : '2px solid transparent', color: 'var(--text-primary)' }}>
                  <span className="mr-3" style={{ color: 'var(--text-tertiary)' }}>{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} className="btn btn-secondary" disabled={currentQ === 0}>Previous</button>
              {currentQ === sampleQuestions.length - 1 ? (
                <button onClick={handleSubmit} className="btn btn-primary" disabled={Object.keys(answers).length < sampleQuestions.length}>Submit Test</button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary" disabled={answers[currentQ] === undefined}>Next <HiArrowRight className="w-4 h-4" /></button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="section relative z-10 text-center">
          <FadeIn>
            <span className="badge mb-4" style={{ background: 'rgba(253,224,71,0.15)', color: '#ca8a04', border: '1px solid rgba(253,224,71,0.3)' }}>
              <HiOutlineAcademicCap className="w-4 h-4" /> Scholarship Program
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
              Win Up to <span className="gradient-text">70% Scholarship</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Take our AI-powered entrance test and unlock massive discounts on all premium courses.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Tiers */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 -mt-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t, i) => (
            <FadeIn key={t.label} delay={i * 0.08}>
              <div className="glass-card p-5 text-center">
                <div className="text-2xl font-extrabold font-[Outfit] mb-1" style={{ color: t.color }}>{t.discount} Off</div>
                <div className="badge mb-2" style={{ background: `${t.color}15`, color: t.color }}>{t.label}</div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Score {t.score}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Info & Start */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <FadeIn delay={0.2}>
          <div className="glass-card p-8 text-center">
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <HiOutlineClock className="w-5 h-5" style={{ color: 'var(--primary)' }} /> 30 Minutes
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <HiOutlineSparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} /> AI-Generated
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <HiOutlineCheckCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Auto-Evaluated
              </div>
            </div>
            <button onClick={() => setStarted(true)} className="btn btn-primary btn-lg">
              Start Scholarship Test <HiArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>Free to attempt • Results are instant • Discount applied automatically</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
