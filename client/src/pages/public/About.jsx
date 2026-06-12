import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineUserGroup,
  HiOutlineHeart,
  HiOutlineSparkles,
} from 'react-icons/hi';

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const values = [
  { icon: HiOutlineSparkles, title: 'AI-First Approach', desc: 'Every feature is enhanced with artificial intelligence to deliver personalized learning experiences.' },
  { icon: HiOutlineHeart, title: 'Student-Centric', desc: 'Built by students, for students. Every design decision is made with learner outcomes in mind.' },
  { icon: HiOutlineGlobe, title: 'Accessible Education', desc: 'Quality education should be affordable. Our scholarship programs ensure nobody is left behind.' },
  { icon: HiOutlineLightningBolt, title: 'Innovation', desc: 'We constantly push boundaries with gamification, real-time analytics, and smart recommendations.' },
];

const team = [
  { name: 'Dr. Anita Verma', role: 'Founder & CEO', emoji: '👩‍💼' },
  { name: 'Rajesh Kumar', role: 'CTO', emoji: '👨‍💻' },
  { name: 'Priya Patel', role: 'Head of Education', emoji: '👩‍🏫' },
  { name: 'Amit Singh', role: 'AI Lead', emoji: '🧑‍🔬' },
];

export default function About() {
  return (
    <div className="page-container">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 gradient-mesh" />
        <div className="section relative z-10 text-center">
          <FadeIn>
            <span className="badge badge-primary mb-4">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] mb-6" style={{ color: 'var(--text-primary)' }}>
              Revolutionizing Education with <span className="gradient-text">AI</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              LearnSphere was founded with a simple mission: make world-class education accessible to every student in India through the power of artificial intelligence.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="section">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <FadeIn>
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Our Mission</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  To democratize quality education by leveraging AI to provide personalized, engaging, and affordable learning experiences for every student preparing for competitive exams.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">🔭</div>
                <h3 className="text-xl font-bold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Our Vision</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  To become India's most trusted and technologically advanced EdTech platform, where every student has access to a personal AI tutor and world-class content.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--bg-primary)' }}>
        <div className="section">
          <FadeIn><h2 className="text-3xl font-bold font-[Outfit] text-center mb-12" style={{ color: 'var(--text-primary)' }}>Our Core <span className="gradient-text">Values</span></h2></FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.08}>
                <div className="glass-card p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <v.icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h4 className="font-semibold mb-2 font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{v.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-primary py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ v: '50K+', l: 'Students' }, { v: '200+', l: 'Teachers' }, { v: '500+', l: 'Courses' }, { v: '95%', l: 'Success Rate' }].map((s) => (
            <div key={s.l}><div className="text-3xl font-extrabold text-white font-[Outfit]">{s.v}</div><div className="text-indigo-200 text-sm mt-1">{s.l}</div></div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--bg-secondary)' }}>
        <div className="section">
          <FadeIn><h2 className="text-3xl font-bold font-[Outfit] text-center mb-12" style={{ color: 'var(--text-primary)' }}>Meet Our <span className="gradient-text">Team</span></h2></FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <div className="glass-card p-6 text-center">
                  <div className="text-5xl mb-3">{t.emoji}</div>
                  <h4 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{t.name}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{t.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--bg-primary)' }}>
        <div className="section text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Join thousands of students already transforming their academic future.</p>
            <Link to="/signup" className="btn btn-primary btn-lg">Join LearnSphere Today</Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
