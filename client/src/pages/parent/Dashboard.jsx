import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiTrendingUp, FiAward, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function ParentDashboard() {
  const [child] = useState({
    name: 'Aarav Sharma', targetExam: 'JEE', level: 12, xp: 2450, streak: 7,
    rank: 'Scholar', attendance: 85, avgScore: 72,
    recentTests: [
      { title: 'Physics — Mechanics', score: 78, total: 100, date: '2026-05-28' },
      { title: 'Chemistry — Organic', score: 65, total: 100, date: '2026-05-25' },
      { title: 'Maths — Calculus', score: 82, total: 100, date: '2026-05-22' },
    ],
    enrolledCourses: [
      { title: 'JEE Physics Complete', progress: 68, teacher: 'Dr. Sharma' },
      { title: 'JEE Chemistry', progress: 45, teacher: 'Prof. Gupta' },
      { title: 'JEE Mathematics', progress: 55, teacher: 'Dr. Verma' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 4.5 }, { day: 'Tue', hours: 3.2 }, { day: 'Wed', hours: 5.1 },
      { day: 'Thu', hours: 2.8 }, { day: 'Fri', hours: 4.0 }, { day: 'Sat', hours: 6.2 }, { day: 'Sun', hours: 3.5 },
    ],
  });

  const stats = [
    { icon: '📊', label: 'Average Score', value: `${child.avgScore}%`, color: '#6366f1' },
    { icon: '📅', label: 'Attendance', value: `${child.attendance}%`, color: '#10b981' },
    { icon: '🔥', label: 'Study Streak', value: `${child.streak} days`, color: '#f59e0b' },
    { icon: '⭐', label: 'XP Earned', value: child.xp.toLocaleString(), color: '#a855f7' },
  ];

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Parent Dashboard</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Monitor {child.name}'s learning progress</p>

        {/* Child Info */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 800 }}>
            {child.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{child.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Target: {child.targetExam} • Level {child.level} • 🎓 {child.rank}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card" style={{ padding: '18px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Recent Test Scores */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📝 Recent Test Scores</h3>
            {child.recentTests.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < child.recentTests.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{t.date}</div>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 700, background: t.score >= 75 ? '#10b98120' : t.score >= 50 ? '#f59e0b20' : '#ef444420', color: t.score >= 75 ? '#10b981' : t.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {t.score}/{t.total}
                </div>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📚 Enrolled Courses</h3>
            {child.enrolledCourses.map((c, i) => (
              <div key={i} style={{ marginBottom: i < child.enrolledCourses.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>by {c.teacher}</div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1' }}>{c.progress}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', width: `${c.progress}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Activity */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📈 Weekly Study Hours</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '160px' }}>
              {child.weeklyActivity.map((d, i) => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.hours}h</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.hours / 7) * 120}px` }} transition={{ delay: i * 0.1, duration: 0.5 }} style={{ width: '100%', borderRadius: '6px 6px 0 0', background: `linear-gradient(to top, #6366f1, #a855f7)`, opacity: 0.8 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
