import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineChat,
  HiOutlineChartBar,
  HiOutlinePlay,
  HiOutlineClipboardCheck,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

/* ── Fade-in wrapper ──────────────────────── */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stats Data ───────────────────────────── */
const stats = [
  { value: '50K+', label: 'Active Students' },
  { value: '500+', label: 'Video Lessons' },
  { value: '95%', label: 'Success Rate' },
  { value: '200+', label: 'Expert Teachers' },
];

/* ── Features Data ────────────────────────── */
const features = [
  {
    icon: HiOutlineSparkles,
    title: 'AI-Powered Learning',
    desc: 'Personalized study plans, smart recommendations, and AI-generated practice tests tailored to your level.',
    color: '#6366f1',
  },
  {
    icon: HiOutlinePlay,
    title: 'HD Video Lessons',
    desc: 'Chapter-wise video lectures with AI summaries, auto subtitles, and note-taking alongside every lesson.',
    color: '#06b6d4',
  },
  {
    icon: HiOutlineChat,
    title: 'AI Doubt Solver',
    desc: '24/7 AI chatbot that instantly resolves your doubts with step-by-step explanations and diagrams.',
    color: '#f59e0b',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Smart Analytics',
    desc: 'Track weak topics, predict your rank, and get performance insights with beautiful analytics dashboards.',
    color: '#10b981',
  },
  {
    icon: HiOutlineClipboardCheck,
    title: 'Mock Tests & PYQs',
    desc: 'AI-generated mock tests, previous year questions, timed exams, and detailed solutions with explanations.',
    color: '#ec4899',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Live Classes',
    desc: 'Interactive live classes with real-time chat, raise hand, polls, and automatic attendance tracking.',
    color: '#8b5cf6',
  },
];

/* ── Categories Data ──────────────────────── */
const categories = [
  { name: 'JEE', icon: '🚀', count: '120+ Courses', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { name: 'NEET', icon: '🧬', count: '95+ Courses', gradient: 'linear-gradient(135deg, #06b6d4, #10b981)' },
  { name: 'CBSE 11', icon: '📘', count: '80+ Courses', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'CBSE 12', icon: '📗', count: '85+ Courses', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { name: 'Bihar Board', icon: '📕', count: '60+ Courses', gradient: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
  { name: 'Jharkhand Board', icon: '📙', count: '55+ Courses', gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)' },
];

/* ── Testimonials Data ────────────────────── */
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'JEE Advanced — AIR 342',
    text: 'LearnSphere\'s AI doubt solver and mock tests helped me improve my rank by 5000 positions in just 3 months!',
    avatar: '👩‍🎓',
  },
  {
    name: 'Rahul Kumar',
    role: 'NEET — 680/720',
    text: 'The personalized study plans and AI-generated practice tests are incredible. Best platform for medical aspirants.',
    avatar: '👨‍🔬',
  },
  {
    name: 'Ananya Singh',
    role: 'CBSE Class 12 — 97%',
    text: 'Love the gamification! Streaks and XP points kept me motivated throughout the year. The video quality is amazing.',
    avatar: '👩‍💻',
  },
];

/* ── Trust Badges ─────────────────────────── */
const trustBadges = [
  { icon: HiOutlineShieldCheck, text: 'Verified Teachers' },
  { icon: HiOutlineGlobe, text: 'English & Hindi' },
  { icon: HiOutlineBookOpen, text: '1000+ Hours Content' },
  { icon: HiOutlineUserGroup, text: '50K+ Community' },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="page-container">
      {/* ═══ HERO SECTION ═══════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-[0.03]" />

        {/* Floating Orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: 'var(--primary)',
            top: '-10%',
            right: '-5%',
            y: heroY,
          }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
          style={{
            background: 'var(--secondary)',
            bottom: '0%',
            left: '-5%',
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="section relative z-10 mx-auto max-w-4xl text-center"
        >
          <div className="w-full">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <HiOutlineSparkles style={{ color: 'var(--primary)' }} className="w-4 h-4" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                AI-Powered Education Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-[Outfit] leading-tight mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="block">Learn Smarter with</span>
              <span className="block">
                <span className="gradient-text animate-gradient" style={{
                  backgroundImage: 'linear-gradient(135deg, #6366f1, #06b6d4, #10b981, #6366f1)',
                  backgroundSize: '300% 300%',
                }}>
                  AI-Powered
                </span>{' '}
                Education
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-center text-balance"
              style={{ color: 'var(--text-secondary)' }}
            >
              India's most advanced learning platform for JEE, NEET, CBSE & State Boards.
              Personalized AI tutoring, smart analytics, and gamified learning — all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link to="/signup" className="btn btn-primary btn-lg group">
                Start Learning Free
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/courses" className="btn btn-secondary btn-lg">
                <HiOutlinePlay className="w-5 h-5" />
                Explore Courses
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 42C1248 44 1344 58 1392 65L1440 72V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
              fill="var(--bg-secondary)"
            />
          </svg>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════ */}
      <section style={{ background: 'var(--bg-secondary)' }} className="section py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold font-[Outfit] gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {stat.label}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══════════════════ */}
      <section style={{ background: 'var(--bg-secondary)' }} className="section">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="badge badge-primary mb-4">Features</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
                Everything You Need to <span className="gradient-text">Excel</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                From AI-powered tutoring to gamified learning, we've built every feature you need to crack your exams.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.08}>
                <div className="glass-card p-6 h-full group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${feat.color}15` }}
                  >
                    <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-[Outfit]" style={{ color: 'var(--text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feat.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES SECTION ═════════════════ */}
      <section style={{ background: 'var(--bg-primary)' }} className="section">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="badge badge-primary mb-4">Categories</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
                Choose Your <span className="gradient-text">Path</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Comprehensive courses for every major exam and board across India.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <FadeIn key={cat.name} delay={i * 0.06}>
                <Link
                  to={`/courses?category=${cat.name}`}
                  className="glass-card p-0.5 text-center group cursor-pointer"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h4 className="font-semibold text-sm mb-1 font-[Outfit]" style={{ color: 'var(--text-primary)' }}>
                    {cat.name}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{cat.count}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════ */}
      <section style={{ background: 'var(--bg-secondary)' }} className="section py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="badge badge-primary mb-4">How It Works</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
                Start Learning in <span className="gradient-text">3 Simple Steps</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-30 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Sign Up & Pick Your Goal', desc: 'Create your free account and select your target exam — JEE, NEET, CBSE, or State Board.' },
              { step: '02', title: 'Learn with AI Guidance', desc: 'Get a personalized study plan, watch video lessons, solve AI-generated tests, and clear doubts instantly.' },
              { step: '03', title: 'Track & Ace Your Exams', desc: 'Monitor your progress with smart analytics, earn XP & badges, and get predicted ranks as you improve.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="text-center relative">
                  <div
                    className="text-6xl font-extrabold font-[Outfit] mb-4 gradient-text opacity-30"
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-[Outfit]" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════ */}
      <section style={{ background: 'var(--bg-primary)' }}>
        <div className="section">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="badge badge-primary mb-4">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
                Loved by <span className="gradient-text">Students</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="glass-card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <HiOutlineStar
                        key={j}
                        className="w-4 h-4"
                        style={{ color: 'var(--accent)', fill: 'var(--accent)' }}
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCHOLARSHIP CTA ════════════════════ */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="section">
          <FadeIn>
            <div
              className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
              }}
            >
              <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ background: 'rgba(253, 224, 71, 0.15)', border: '1px solid rgba(253, 224, 71, 0.3)' }}>
                  <HiOutlineAcademicCap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Scholarship Program</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-[Outfit] mb-4">
                  Win Up to 60% Scholarship!
                </h2>
                <p className="text-indigo-200 max-w-xl mx-auto mb-8">
                  Take our AI-powered scholarship entrance test and unlock massive discounts on all premium courses.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                  {[
                    { score: '90%+', discount: '60% Off' },
                    { score: '80%+', discount: '50% Off' },
                    { score: '70%+', discount: '40% Off' },
                    { score: '0-69%', discount: '10% Off' },
                  ].map((tier) => (
                    <div key={tier.score} className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">{tier.score}</span>
                      <span className="text-indigo-300">→</span>
                      <span className="text-yellow-400 font-bold">{tier.discount}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/scholarship"
                  className="btn btn-lg inline-flex"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  Take Scholarship Test
                  <HiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
