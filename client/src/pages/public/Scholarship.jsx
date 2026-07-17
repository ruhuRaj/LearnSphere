import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiOutlineAcademicCap, HiOutlineClock, HiOutlineCheckCircle, HiOutlineSparkles, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>{children}</motion.div>;
}

const tiers = [
  { score: '90%+', discount: '60%', color: '#10b981', label: 'Platinum' },
  { score: '80%+', discount: '50%', color: '#6366f1', label: 'Gold' },
  { score: '70%+', discount: '40%', color: '#f59e0b', label: 'Silver' },
  { score: '0-69%', discount: '10%', color: '#06b6d4', label: 'Bronze' },
];

const categories = [
  { value: 'JEE', label: 'JEE' },
  { value: 'NEET', label: 'NEET' },
  { value: 'CBSE11', label: 'CBSE Class 11' },
  { value: 'CBSE12', label: 'CBSE Class 12' },
  { value: 'Bihar', label: 'Bihar Board' },
  { value: 'Jharkhand', label: 'Jharkhand Board' },
  { value: 'Bengal', label: 'Bengal Board' },
];

export default function Scholarship() {
  const [step, setStep] = useState('intro');
  const [form, setForm] = useState({ name: '', email: '', phone: '', courseCategory: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scholarshipId, setScholarshipId] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);

  const sendOtp = async () => {
    if (!form.email) {
      toast.error('Enter your email first to get the OTP.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/scholarship/send-otp', { email: form.email });
      setOtpSent(true);
      toast.success('OTP sent to your email. Check your inbox and spam folder.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send OTP. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.email || !otp) {
      toast.error('Please enter your email and the OTP code.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/scholarship/verify-otp', { email: form.email, code: otp });
      setOtpVerified(true);
      toast.success('Email verified successfully. Now submit the application.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const applyForScholarship = async () => {
    if (!form.name || !form.email || !form.phone || !form.courseCategory) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!otpVerified) {
      toast.error('Verify your email with OTP before starting the test.');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post('/scholarship/apply', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        courseCategory: form.courseCategory,
      });
      setScholarshipId(data.scholarshipId);
      setTest(data.test);
      setStep('test');
      setStartTime(Date.now());
      toast.success('Scholarship test started. Answer all questions to generate your coupon.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to start scholarship test.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: value }));
  };

  const handleSubmitTest = async () => {
    if (!test || !scholarshipId) return;
    if (Object.keys(answers).length < test.questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const { data } = await api.post(`/scholarship/${scholarshipId}/submit`, {
        answers,
        timeTaken,
      });
      setResult(data.coupon);
      localStorage.setItem('scholarshipCoupon', JSON.stringify({ code: data.coupon.code, discountPercent: data.coupon.discountPercent, percentage: data.coupon.percentage }));
      setStep('result');
      toast.success('Test submitted! Coupon generated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit test.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountLabel = (score) => {
    if (score >= 90) return { discount: '60%', tier: 'Platinum', color: '#10b981' };
    if (score >= 80) return { discount: '50%', tier: 'Gold', color: '#6366f1' };
    if (score >= 70) return { discount: '40%', tier: 'Silver', color: '#f59e0b' };
    if (score <= 69) return { discount: '10%', tier: 'Bronze', color: '#06b6d4' };
    return { discount: '0%', tier: 'Keep trying!', color: 'var(--text-tertiary)' };
  };

  const renderQuestionInput = (question, answer) => {
    if (question.type === 'true-false') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {['True', 'False'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(option.toLowerCase())}
              className="w-full rounded-xl px-4 py-4 transition-all text-sm font-medium"
              style={{
                background: answer === option.toLowerCase() ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                border: answer === option.toLowerCase() ? '2px solid var(--primary)' : '2px solid transparent',
                color: 'var(--text-primary)',
              }}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'fill-in-the-blank') {
      return (
        <textarea
          value={answer || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-transparent bg-var(--bg-tertiary) p-4 text-sm text-var(--text-primary) outline-none"
          placeholder="Write your answer here"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        />
      );
    }

    return (
      <div className="space-y-3">
        {(question.options || []).map((option, optionIndex) => (
          <button
            key={`opt-${optionIndex}`}
            type="button"
            onClick={() => handleAnswer(optionIndex)}
            className="w-full text-left p-4 rounded-xl transition-all text-sm font-medium"
            style={{
              background: answer === optionIndex ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
              border: answer === optionIndex ? '2px solid var(--primary)' : '2px solid transparent',
              color: 'var(--text-primary)',
            }}
          >
            <span className="mr-3" style={{ color: 'var(--text-tertiary)' }}>{String.fromCharCode(65 + optionIndex)}.</span>
            {option.text || option}
          </button>
        ))}
      </div>
    );
  };

  if (step === 'result' && result) {
    const label = getDiscountLabel(result.percentage);
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>You scored {result.percentage}%</h2>
          <div className="text-4xl font-extrabold font-[Outfit] my-4" style={{ color: label.color }}>{label.discount} Scholarship!</div>
          <p className="badge mb-4" style={{ background: `${label.color}20`, color: label.color }}>{label.tier} Tier</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Your coupon code is:</p>
          <div className="glass-card p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{result.code}</div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Apply this once during checkout.</p>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>The coupon will be automatically remembered for your next checkout.</p>
          <a href="/checkout" className="btn btn-primary btn-lg">Go to Checkout</a>
        </motion.div>
      </div>
    );
  }

  if (step === 'test' && test) {
    const question = test.questions[currentQ] || {};
    const answer = answers[currentQ];
    const progress = Math.min(100, Math.round(((currentQ + 1) / test.questions.length) * 100));
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '80vh' }}>
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Question {currentQ + 1}/{test.questions.length}</span>
            <div className="h-2 flex-1 mx-4 rounded-full overflow-hidden bg-var(--bg-tertiary)">
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{progress}%</span>
          </div>

          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{question.text || question.question || question.q}</h3>
            {renderQuestionInput(question, answer)}
            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} className="btn btn-secondary" disabled={currentQ === 0}>Previous</button>
              {currentQ === (test.questions.length - 1) ? (
                <button onClick={handleSubmitTest} className="btn btn-primary" disabled={Object.keys(answers).length < test.questions.length || submitting}>
                  {submitting ? 'Submitting…' : 'Submit Test'}
                </button>
              ) : (
                <button onClick={() => setCurrentQ((prev) => Math.min(test.questions.length - 1, prev + 1))} className="btn btn-primary" disabled={answer === undefined}>
                  Next <HiArrowRight className="w-4 h-4" />
                </button>
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
              Win Up to <span className="gradient-text">60% Scholarship</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Take our AI-powered scholarship test and unlock a one-time coupon for your next course purchase.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 mt-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <FadeIn delay={0.2}>
          <div className="glass-card p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Start the scholarship workflow</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Register yourself and take the AI-powered test, and earn a one-time coupon for course checkout.</p>
              </div>
              <button onClick={() => setStep('application')} className="btn btn-primary btn-lg">
                Start Test <HiArrowRight className="w-5 h-5" />
              </button>
            </div>

            {step === 'application' && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="input-group">
                    <span>Name</span>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="input input-bordered w-full" />
                  </label>
                  <label className="input-group">
                    <span>Email</span>
                    <input value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setOtpSent(false); setOtpVerified(false); }} placeholder="you@example.com" className="input input-bordered w-full" type="email" />
                  </label>
                  <label className="input-group">
                    <span>Phone</span>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" className="input input-bordered w-full" />
                  </label>
                  <label className="input-group">
                    <span>Category</span>
                    <select value={form.courseCategory} onChange={(e) => setForm({ ...form, courseCategory: e.target.value })} className="input input-bordered w-full">
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="glass-card p-6 bg-slate-950/20 border border-slate-800 rounded-3xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Email verification</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send OTP to verify your email before the test.</p>
                    </div>
                    <button onClick={sendOtp} disabled={submitting || !form.email} className="btn btn-secondary">
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>

                  {otpSent && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="input-group">
                        <span>OTP</span>
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="input input-bordered w-full" />
                      </label>
                      <button onClick={verifyOtp} disabled={submitting || !otp} className="btn btn-primary">
                        {otpVerified ? 'Verified' : 'Verify OTP'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <button onClick={applyForScholarship} className="btn btn-primary btn-lg" disabled={submitting || !otpVerified}>
                    {submitting ? 'Starting test…' : 'Start Scholarship Test'}
                  </button>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No login or signup is required for this scholarship test. Just register yourself !!</span>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
