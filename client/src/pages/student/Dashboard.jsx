import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { logout } from '../../features/authSlice';
import { toggleTheme } from '../../features/uiSlice';
import MessageRenderer from '../../components/common/MessageRenderer';
import LiveClasses from './LiveClasses';
import MockTestStudio from './MockTestStudio';

const TeacherTestViewer = ({ test }) => {
  if (!test) return null;

  const pdfUrl = test?.pdfUrl || test?.pdfLocalPath || '';

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 16 }}>
      {pdfUrl ? (
        <iframe
          title={test.title}
          src={pdfUrl}
          style={{ width: '100%', height: '100%', borderRadius: 16, border: 'none' }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          <p>PDF is being prepared. Please check again shortly.</p>
        </div>
      )}
    </div>
  );
};

const CHAT_STARTERS = [
  'Explain Newton\'s second law with an example',
  'What is the difference between speed and velocity?',
  'Solve: ∫x²dx from 0 to 3',
  'Give me 3 MCQs on projectile motion',
];

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'courses', label: 'My Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'notes', label: 'Notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'lectures', label: 'Watch Lectures', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'doubts', label: 'Ask Doubts', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'ai', label: 'AI Assistant', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'buy', label: 'Buy Courses', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 'live', label: 'Live Classes', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'mocktests', label: 'Mock Tests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'teacherTests', label: 'Teacher Tests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const COURSE_GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#4F46E5)',
  'linear-gradient(135deg,#0891B2,#0E7490)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#F59E0B,#FB7185)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
];

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const C = {
  violet: 'var(--primary)',
  violetD: 'var(--primary)',
  violetSoft: 'rgba(124, 58, 237, 0.12)',
  violetBorder: 'rgba(124, 58, 237, 0.25)',
  cyan: 'var(--secondary)',
  cyanSoft: 'rgba(8, 145, 178, 0.10)',
  emerald: 'var(--success, #059669)',
  emeraldSoft: 'rgba(5, 150, 105, 0.10)',
  amber: 'var(--warning, #D97706)',
  amberSoft: 'rgba(217, 119, 6, 0.10)',
  red: 'var(--error, #EF4444)',
  bg: 'var(--bg-primary)',
  surface: 'var(--bg-secondary)',
  surfaceHover: 'var(--bg-tertiary)',
  border: 'var(--border-color)',
  borderHover: 'var(--border-color)',
  text: 'var(--text-primary)',
  textMid: 'var(--text-secondary)',
  textDim: 'var(--text-tertiary)',
};

/* ─────────────────────────────────────────────
   TINY SHARED ATOMS
───────────────────────────────────────────── */
const Icon = ({ d, size = 18, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d.split(' M').map((p, i) => <path key={i} d={(i === 0 ? '' : 'M') + p} />)}
  </svg>
);

const Tag = ({ children, color = C.violet, bg = C.violetSoft }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    padding: '2px 8px', borderRadius: 100,
    color, background: bg,
  }}>{children}</span>
);

const Ring = ({ pct = 0, size = 44, stroke = 3.5, color = C.violet }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(pct, 100) / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={color} style={{ fontSize: size * 0.22, fontWeight: 700 }}>{Math.round(pct)}%</text>
    </svg>
  );
};

const Avatar = ({ name, src, size = 44 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const resolvedSrc = (() => {
    if (!src || imgError) return '';

    const normalized = String(src).replace(/\\/g, '/');

    if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:')) return normalized;
    if (normalized.startsWith('/')) return normalized;
    if (normalized.startsWith('uploads/')) return `/${normalized}`;

    return `/uploads/${normalized}`;
  })();

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: size * 0.32, objectFit: 'cover' }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      background: 'linear-gradient(135deg,#7C3AED,#0891B2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
};

const Card = ({ children, style = {}, hover = false, ...props }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      {...props}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? C.borderHover : C.border}`,
        borderRadius: 18,
        transition: 'all 0.18s ease',
        transform: hov && hover ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const EmptyState = ({ icon, text, sub }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: C.text }}>{text}</p>
    <p style={{ margin: 0, fontSize: 12, color: C.textDim }}>{sub}</p>
  </div>
);

/* ─────────────────────────────────────────────
   COURSE SELECTOR (shared across Notes/Lectures)
───────────────────────────────────────────── */
const CourseTopicPicker = ({ courses, selectedCourse, setSelectedCourse, setSelectedTopic }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
    {courses.map((c) => {
      const courseId = c._id || c.id;
      const isSelected = !!selectedCourse && ((selectedCourse._id || selectedCourse.id) === courseId);
      return (
        <button key={courseId} onClick={() => { setSelectedCourse(c); setSelectedTopic(''); }}
          style={{
            padding: '7px 14px', borderRadius: 100, border: '1px solid',
            borderColor: isSelected ? C.violet : C.border,
            background: isSelected ? C.violetSoft : 'transparent',
            color: isSelected ? C.violet : C.textMid,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
          {c.emoji || '📘'} {c.title.split('–')[0].trim()}
        </button>
      );
    })}
  </div>
);

const TopicTabs = ({ topics = [], selected, onSelect }) => (
  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
    {topics.map(t => (
      <button key={t} onClick={() => onSelect(t)}
        style={{
          padding: '5px 12px', borderRadius: 8, border: '1px solid',
          borderColor: selected === t ? C.violet : C.border,
          background: selected === t ? C.violet : 'transparent',
          color: selected === t ? '#fff' : C.textMid,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}>{t}</button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════
   SECTIONS
═══════════════════════════════════════════════════ */

/* ── DASHBOARD ── */
function Dashboard({ user, courses }) {
  const xp = user.xp, level = user.level;
  const xpPct = Math.min(100, (xp / (level * 500)) * 100);
  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  const avgProgress = courses.length ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length) : 0;

  const stats = [
    { label: 'Courses', value: courses.length, color: C.violet, bg: C.violetSoft, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Lessons', value: totalLessons, color: C.cyan, bg: C.cyanSoft, icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Avg Progress', value: `${avgProgress}%`, color: C.emerald, bg: C.emeraldSoft, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'XP Earned', value: xp, color: C.amber, bg: C.amberSoft, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        borderRadius: 20, padding: '28px 28px 24px',
        background: 'linear-gradient(130deg, rgba(124,58,237,0.18) 0%, rgba(8,145,178,0.10) 100%)',
        border: `1px solid ${C.violetBorder}`,
        marginBottom: 24,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* avatar + xp ring */}
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: -4 }}>
              <Ring pct={xpPct} size={80} stroke={3} color={C.violet} />
            </div>
            <Avatar name={user.name} src={user.avatar} size={72} />
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 13, color: C.textMid }}>
              {user.targetExam} Aspirant · Level {level} · 🔥 {user.streak} day streak
            </p>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}>
              Hey, {user.name.split(' ')[0]}! 👋
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>{user.email} · {user.phone}</p>
          </div>
        </div>
        {/* XP bar */}
        <div style={{ minWidth: 180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: C.textDim }}>
            <span>XP to Level {level + 1}</span>
            <span>{xp} / {level * 500}</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${xpPct}%`, background: 'linear-gradient(90deg,#7C3AED,#0891B2)', transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: '18px 18px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon d={s.icon} size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Outfit, system-ui, sans-serif', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Enrolled courses quick view */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textMid, margin: '0 0 12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Continue Learning
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courses.map(c => (
          <Card key={c.id} hover style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: C.textDim }}>{c.teacher} · {c.completedLessons}/{c.totalLessons} lessons</p>
              <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${c.progress}%`, background: c.gradient }} />
              </div>
            </div>
            <Ring pct={c.progress} size={46} stroke={4} color={C.violet} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── MY COURSES ── */
function MyCourses({ courses }) {
  return (
    <div>
      <h2 style={sectionTitle}>My Enrolled Courses</h2>
      {courses.length === 0 ? (
        <EmptyState
          icon="📚"
          text="Not enrolled in any course yet"
          sub="Check back after enrolling to courses"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {courses.map(c => (
            <Card key={c.id} hover style={{ overflow: 'hidden' }}>
              <div style={{ height: 80, background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{c.emoji}</div>
              <div style={{ padding: '16px' }}>
                <Tag>{c.category}</Tag>
                <p style={{ margin: '8px 0 2px', fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}>{c.title}</p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textDim }}>{c.teacher}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${c.progress}%`, background: c.gradient }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.violet }}>{c.progress}%</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: C.textDim }}>{c.completedLessons}/{c.totalLessons} lessons completed</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── NOTES ── */
function Notes({ courses, notes = [] }) {
  const [selCourse, setSelCourse] = useState(courses[0] || null);
  const [selTopic, setSelTopic] = useState('');
  const [openNote, setOpenNote] = useState(null);

  useEffect(() => {
    if (courses[0]) {
      setSelCourse(courses[0]);
    }
  }, [courses]);

  const topics = useMemo(() => {
    if (!selCourse) return [];
    const topicList = notes
      .filter((note) => (note.course?._id || note.course) === (selCourse._id || selCourse.id))
      .map((note) => note.subject || note.topic || 'General')
      .filter(Boolean);
    return [...new Set(topicList)];
  }, [notes, selCourse]);

  useEffect(() => {
    if (topics.length && !topics.includes(selTopic)) {
      setSelTopic(topics[0]);
    }
  }, [topics, selTopic]);

  const noteList = useMemo(() => {
    if (!selCourse) return [];
    return notes.filter((note) => {
      const sameCourse = (note.course?._id || note.course) === (selCourse._id || selCourse.id);
      const sameTopic = !selTopic || (note.subject || note.topic || 'General') === selTopic;
      return sameCourse && sameTopic;
    });
  }, [notes, selCourse, selTopic]);

  return (
    <div>
      <h2 style={sectionTitle}>Notes</h2>
      <CourseTopicPicker courses={courses} selectedCourse={selCourse} setSelectedCourse={setSelCourse} selectedTopic={selTopic} setSelectedTopic={setSelTopic} />
      <TopicTabs topics={topics} selected={selTopic} onSelect={setSelTopic} />

      {openNote ? (
        <Card style={{ padding: 24 }}>
          <button onClick={() => setOpenNote(null)} style={backBtn}>← Back to notes</button>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 6px', fontFamily: 'Outfit, system-ui, sans-serif' }}>{openNote.title || 'Notes'}</h3>
          <p style={{ fontSize: 11, color: C.textDim, margin: '0 0 20px' }}>{selCourse?.title} · {openNote.chapter || openNote.subject || selTopic || 'General'} · {formatDate(openNote.createdAt || openNote.date)}</p>
          {(openNote.localPath || openNote.fileUrl) && (
            <div style={{ marginBottom: 18 }}>
              <a
                href={openNote.localPath || openNote.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}
              >
                Open PDF Notes
              </a>
            </div>
          )}
          <div style={{ fontSize: 14, lineHeight: 1.85, color: C.textMid, whiteSpace: 'pre-wrap' }}>{openNote.content || openNote.description || ((openNote.localPath || openNote.fileUrl) ? 'This is a PDF note. Open it above.' : 'No summary available for this note yet.')}</div>
        </Card>
      ) : noteList.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {noteList.map(n => (
            <Card key={n.id} hover style={{ padding: 18, cursor: 'pointer' }} onClick={() => setOpenNote(n)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{n.title || 'Untitled Note'}</p>
              </div>
                <Tag>{(n.localPath || n.fileUrl) ? 'PDF' : (n.subject || selTopic || 'Note').split(' ')[0]}</Tag>

              <p style={{ margin: '0 0 10px', fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{(n.content || n.description || ((n.localPath || n.fileUrl) ? 'PDF notes available' : 'No note preview available.')).slice(0, 100)}…</p>
              <p style={{ margin: 0, fontSize: 10, color: C.textDim }}>{formatDate(n.createdAt || n.date)}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📝" text="No notes for this topic yet" sub="Check back after your teacher uploads notes." />
      )}
    </div>
  );
}

/* ── LECTURES ── */
function Lectures({ courses, videosByCourse = {} }) {
  const [selCourse, setSelCourse] = useState(courses[0] || null);
  const [selTopic, setSelTopic] = useState('');
  const [playing, setPlaying] = useState(null);
  const videoRef = useState(null)[0];

  useEffect(() => {
    if (courses[0]) {
      setSelCourse(courses[0]);
    }
  }, [courses]);

  const videos = useMemo(() => {
    if (!selCourse) return [];
    return (videosByCourse[selCourse._id || selCourse.id] || []).filter((video) => !selTopic || (video.chapter || 'General') === selTopic);
  }, [selCourse, selTopic, videosByCourse]);

  const topics = useMemo(() => {
    if (!selCourse) return [];
    return [...new Set((videosByCourse[selCourse._id || selCourse.id] || []).map((video) => video.chapter || 'General'))];
  }, [selCourse, videosByCourse]);

  useEffect(() => {
    if (topics.length && !topics.includes(selTopic)) {
      setSelTopic(topics[0]);
    }
  }, [topics, selTopic]);

  const currentUrl = playing?.url || '';
  const youtubeIdMatch = currentUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  const isYoutubeUrl = Boolean(youtubeIdMatch);
  const youtubeEmbedUrl = youtubeIdMatch ? `https://www.youtube.com/embed/${youtubeIdMatch[1]}` : '';

  return (
    <div>
      <h2 style={sectionTitle}>Watch Lectures</h2>
      <CourseTopicPicker courses={courses} selectedCourse={selCourse} setSelectedCourse={setSelCourse} selectedTopic={selTopic} setSelectedTopic={setSelTopic} />
      <TopicTabs topics={topics} selected={selTopic} onSelect={setSelTopic} />

      {playing ? (
        <Card style={{ padding: 24 }}>
          <button onClick={() => setPlaying(null)} style={backBtn}>← Back to lectures</button>

          <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            {currentUrl ? (
              isYoutubeUrl ? (
                <iframe
                  title={playing.title || 'Video lesson'}
                  src={youtubeEmbedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block' }}
                />
              ) : (
                <video
                  key={currentUrl}
                  src={currentUrl}
                  controls
                  playsInline
                  preload="metadata"
                  width="100%"
                  height="100%"
                  style={{ display: 'block', background: '#000' }}
                >
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{selCourse?.emoji}</div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 4px', textAlign: 'center', padding: '0 24px' }}>
                  This video has no playable source yet
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>Ask your teacher to re-upload this lecture.</p>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 4px', fontFamily: 'Outfit, system-ui, sans-serif' }}>{playing.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: C.textDim }}>{selCourse?.title} · {playing.chapter || selTopic || 'General'} · {playing.durationLabel || playing.duration}</p>
        </Card>
      ) : videos.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {videos.map(v => (
            <Card key={v.id} hover style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setPlaying(v)}>
              <div style={{ width: 52, height: 40, borderRadius: 10, background: v.watched ? C.emeraldSoft : C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color={v.watched ? C.emerald : C.violet} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: C.text }}>{v.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.textDim }}>{v.chapter || selTopic || 'General'} · {v.durationLabel || v.duration}</p>
              </div>
              {v.watched && <Tag color={C.emerald} bg={C.emeraldSoft}>Watched</Tag>}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="🎬" text="No lectures for this topic yet" sub="Videos will appear here once your teacher uploads them." />
      )}
    </div>
  );
}

/* ── DOUBTS ── */
function Doubts({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || null);
  const [question, setQuestion] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedCourseId = selectedCourse?._id || selectedCourse?.id || '';

  useEffect(() => {
    if (!selectedCourse && courses.length) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    const fetchDoubts = async () => {
      if (!selectedCourseId) {
        setDoubts([]);
        return;
      }

      setLoadingDoubts(true);
      setError(null);

      try {
        const response = await api.get('/doubts', { params: { course: selectedCourseId, limit: 50 } });
        setDoubts(response?.data?.doubts || []);
      } catch (err) {
        console.error('Failed to load doubts:', err);
        setError('Unable to load doubt history.');
      } finally {
        setLoadingDoubts(false);
      }
    };

    fetchDoubts();
  }, [selectedCourseId]);

  const handleSend = async () => {
    if (!selectedCourseId || !question.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/doubts', {
        course: selectedCourseId,
        question: question.trim(),
      });
      setQuestion('');
      const response = await api.get('/doubts', { params: { course: selectedCourseId, limit: 50 } });
      setDoubts(response?.data?.doubts || []);
    } catch (err) {
      console.error('Failed to send doubt:', err);
      setError(err.response?.data?.message || 'Unable to submit your doubt.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={sectionTitle}>Ask Doubts</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {courses.map((course) => {
          const courseId = course._id || course.id;
          return (
            <button key={courseId} onClick={() => setSelectedCourse(course)}
              style={{
                padding: '6px 14px', borderRadius: 100, border: '1px solid',
                borderColor: selectedCourseId === courseId ? C.violet : C.border,
                background: selectedCourseId === courseId ? C.violetSoft : 'transparent',
                color: selectedCourseId === courseId ? C.violet : C.textMid,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              {course.emoji} {course.title.split('–')[0].trim()}
            </button>
          );
        })}
      </div>

      {!selectedCourse ? (
        <Card style={{ padding: 24, minHeight: 300 }}>
          <p style={{ margin: 0, color: C.textDim }}>Select a course to view your course-specific doubt history and ask new questions.</p>
        </Card>
      ) : (
        <Card style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: selectedCourse.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{selectedCourse.emoji}</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{selectedCourse.title}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.textDim }}>{selectedCourse.teacher} · <span style={{ color: C.emerald }}>● Course doubt history</span></p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingDoubts ? (
              <p style={{ margin: 0, color: C.textDim }}>Loading doubts for this course…</p>
            ) : error ? (
              <p style={{ margin: 0, color: C.red }}>{error}</p>
            ) : doubts.length === 0 ? (
              <p style={{ margin: 0, color: C.textDim }}>No doubts found for this course yet. Ask your first question below.</p>
            ) : (
              doubts.map((doubt) => (
                <div key={doubt._id} style={{ borderRadius: 16, padding: 14, background: C.surfaceHover, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{doubt.question}</p>
                    <Tag color={doubt.status === 'answered' ? C.emerald : doubt.status === 'resolved' ? C.cyan : C.violet} bg="rgba(124,58,237,0.08)">{doubt.status}</Tag>
                  </div>
                  {doubt.replies?.length > 0 && (
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {doubt.replies.map((reply) => (
                        <div key={reply._id || reply.createdAt} style={{ padding: 10, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}>
                          <p style={{ margin: '0 0 4px', fontSize: 12, color: C.textMid }}>{reply.text}</p>
                          <p style={{ margin: 0, fontSize: 10, color: C.textDim }}>{reply.role === 'teacher' ? 'Teacher reply' : 'AI reply'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your doubt about this course…"
              style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 13, outline: 'none' }}
            />
            <button onClick={handleSend} disabled={submitting || !question.trim()} style={{ padding: '10px 16px', borderRadius: 10, background: C.violet, border: 'none', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 13 }}>
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── AI ASSISTANT ── */
function AIAssistant({ courses }) {
  const [msgs, setMsgs] = useState([
    { from: 'ai', text: 'Hi! I\'m your AI study assistant. Ask me anything — concepts, solved examples, MCQs, or topic summaries.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const RESPONSES = {
    default: [
      'Great question! Let me break this down step by step for you.\n\nIn physics and mathematics, the key is to understand the underlying principle before applying formulas. Start by identifying what is given and what needs to be found, then choose the appropriate equation or concept.',
      'Here\'s a clear explanation:\n\nThis topic often confuses students, but the core idea is simple. Think of it as a relationship between cause and effect — once you grasp that, everything else follows naturally.',
      'Let me solve this systematically:\n\nStep 1: Identify the knowns and unknowns.\nStep 2: Select the relevant formula or theorem.\nStep 3: Substitute values and simplify.\nStep 4: Verify your answer with units.',
    ],
  };

  const ask = async (q) => {
    const question = (q || input).trim();
    if (!question) return;
    setMsgs(m => [...m, { from: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/solve-doubt', {
        question,
        subject: 'General',
        context: '',
      });
      const reply = data?.response || 'Sorry, I could not generate an answer right now.';
      setMsgs(m => [...m, { from: 'ai', text: reply }]);
    } catch (error) {
      const message = error?.response?.data?.detail || error?.response?.data?.message || 'The AI service is temporarily unavailable.';
      setMsgs(m => [...m, { from: 'ai', text: `Sorry — ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={sectionTitle}>AI Assistant</h2>
      <Card style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" size={17} color={C.violet} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>StudyAI</p>
            <p style={{ margin: 0, fontSize: 11, color: C.emerald }}>● Always available</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
              {m.from === 'ai' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={13} color={C.violet} />
                </div>
              )}
              <div style={{
                maxWidth: '72%', padding: '10px 14px',
                borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.from === 'user' ? C.violet : C.surfaceHover,
                color: C.text, fontSize: 13, lineHeight: 1.65,
              }}>
                {m.from === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                ) : (
                  <MessageRenderer content={m.text} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={13} color={C.violet} />
              </div>
              <div style={{ padding: '8px 14px', borderRadius: '16px 16px 16px 4px', background: C.surfaceHover, display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet, display: 'inline-block', animation: `dot ${0.8}s ${j * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Starters */}
        {msgs.length < 3 && (
          <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {CHAT_STARTERS.map(s => (
              <button key={s} onClick={() => ask(s)}
                style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.textMid, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="Ask a concept, get MCQs, request a summary…"
            style={{ flex: 1, padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.text, fontSize: 13, outline: 'none' }} />
          <button onClick={() => ask()} style={{ padding: '8px 16px', borderRadius: 10, background: C.violet, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Ask</button>
        </div>
      </Card>
    </div>
  );
}

/* ── TEACHER TESTS ── */
function TeacherTests({ courses, teacherTests = [] }) {
  const [selCourse, setSelCourse] = useState(courses[0] || null);

  useEffect(() => {
    if (courses[0] && !selCourse) {
      setSelCourse(courses[0]);
    }
  }, [courses, selCourse]);

  const filteredTests = useMemo(() => {
    if (!selCourse) return [];
    const courseId = selCourse._id || selCourse.id;
    return teacherTests.filter((test) => {
      const testCourseId = test.course?._id || test.course?.id || test.course;
      return testCourseId === courseId;
    });
  }, [teacherTests, selCourse]);

  return (
    <div>
      <h2 style={sectionTitle}>Teacher Tests</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textMid }}>View teacher-created question papers in PDF format.</p>
      <CourseTopicPicker courses={courses} selectedCourse={selCourse} setSelectedCourse={setSelCourse} setSelectedTopic={() => {}} />

      {filteredTests.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filteredTests.map((test) => (
            <Card key={test._id} hover style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: C.text }}>{test.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.textDim }}>{test.topicName || 'Topic'}</p>
                </div>
                <Tag color={C.amber} bg={C.amberSoft}>{test.duration || 0} min</Tag>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textMid }}>
                <span>{test.questionCount || 0} Questions</span>
                <span>•</span>
                <span>{test.totalMarks || 0} Marks</span>
              </div>
              <div style={{ flex: 1 }}></div>
              <button
                onClick={() => {
                  const pdfUrl = test?.pdfUrl || test?.pdfLocalPath || '';
                  if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                }}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: 10,
                  background: C.violet,
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                View Paper
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📄" text="No tests for this course yet" sub="Check back after your teacher uploads test papers." />
      )}
    </div>
  );
}

/* ── BUY COURSES ── */
function BuyCourses({ user, courses = [], onEnroll, enrollingCourseId }) {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCourses = courses.filter((c) => {
    if (!normalizedSearch) return true;
    const title = String(c.title || '').toLowerCase();
    const category = String(c.category || '').toLowerCase();
    const teacher = String(c.teacher?.name || c.teacher || '').toLowerCase();
    const tags = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : String(c.tags || '').toLowerCase();
    return title.includes(normalizedSearch)
      || category.includes(normalizedSearch)
      || teacher.includes(normalizedSearch)
      || tags.includes(normalizedSearch);
  });

  return (
    <div>
      <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Explore Courses</h2>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: C.textMid }}>Enroll directly from here — no payment step is required right now.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by title, category, teacher or tag..."
          style={{
            flex: 1,
            minWidth: 220,
            padding: '12px 14px',
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            background: C.surfaceHover,
            color: C.text,
            outline: 'none',
            fontSize: 13,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              padding: '12px 16px',
              borderRadius: 14,
              border: 'none',
              background: C.violet,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Clear
          </button>
        )}
      </div>
      {filteredCourses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filteredCourses.map((c, index) => {
            const price = Number(c.discountPrice || c.price || 0);
            const rating = Number(c.rating || 4.7);
            const teacherName = c.teacher?.name || c.teacher || 'Instructor';
            return (
              <Card key={c._id || c.id || `${c.title}-${index}`} hover style={{ padding: '18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" size={18} color={C.violet} />
                  </div>
                  <Tag>{c.category || 'Course'}</Tag>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}>{c.title}</p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textDim }}>{teacherName}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#FFC107', fontSize: 12 }}>{'★'.repeat(Math.min(5, Math.max(1, Math.round(rating))))}</span>
                    <span style={{ fontSize: 11, color: C.textDim, marginLeft: 4 }}>{rating.toFixed(1)}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.violet }}>{price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Free'}</span>
                </div>
                <button
                  onClick={() => onEnroll(c)}
                  disabled={enrollingCourseId === (c._id || c.id)}
                  style={{
                    marginTop: 12, width: '100%', padding: '9px', borderRadius: 10,
                    background: enrollingCourseId === (c._id || c.id) ? 'rgba(124,58,237,0.55)' : C.violet,
                    border: 'none', color: '#fff', fontWeight: 700,
                    fontSize: 13, cursor: 'pointer',
                  }}>
                  {enrollingCourseId === (c._id || c.id) ? 'Enrolling…' : 'Enroll Now'}
                </button>
              </Card>
            );
          })}
        </div>
      ) : courses.length > 0 ? (
        <EmptyState icon="🔎" text="No courses match your search" sub="Try another keyword or clear the search." />
      ) : (
        <EmptyState icon="📚" text="No courses available to enroll right now" sub="New courses will appear here once your teacher publishes them." />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED STYLE HELPERS
───────────────────────────────────────────── */
const sectionTitle = { fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 20px', fontFamily: 'Outfit, system-ui, sans-serif' };
const backBtn = { background: 'none', border: 'none', color: C.violet, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 16, display: 'block' };

/* ═══════════════════════════════════════════════════
   ROOT — SIDEBAR + CONTENT SHELL
═══════════════════════════════════════════════════ */
export default function StudentPortal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videosByCourse, setVideosByCourse] = useState({});
  const [teacherTests, setTeacherTests] = useState([]);
  const [selectedTeacherTest, setSelectedTeacherTest] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => ({
    name: authUser?.name || 'Student',
    email: authUser?.email || '',
    phone: authUser?.phone || 'No phone number',
    avatar: authUser?.avatar || null,
    role: authUser?.role || 'student',
    targetExam: authUser?.targetExam || 'Learning',
    xp: Number(authUser?.xp || 0),
    level: Number(authUser?.level || Math.max(1, Math.floor((authUser?.xp || 0) / 500) + 1)),
    streak: Number(authUser?.streak || 0),
  }), [authUser]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [enrolledResponse, notesResponse, catalogResponse, testsResponse] = await Promise.all([
          api.get('/courses/enrolled'),
          api.get('/notes'),
          api.get('/courses?limit=50'),
          api.get('/tests?limit=20'),
        ]);

        if (!isMounted) return;

        const enrolled = (enrolledResponse?.data?.courses || []).map((course, index) => ({
          ...course,
          id: course._id || course.id,
          _id: course._id || course.id,
          emoji: course.emoji || ['📘', '📐', '🧪', '⚛️'][index % 4],
          gradient: course.gradient || COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
          teacher: typeof course.teacher === 'object' ? course.teacher?.name || 'Instructor' : course.teacher || 'Instructor',
          progress: Math.min(100, Number(course.progress || 0) || Math.round((Number(course.completedLessons || 0) / Math.max(1, Number(course.totalLessons || 1))) * 100)),
          totalLessons: Number(course.totalLessons || 0),
          completedLessons: Number(course.completedLessons || 0),
        }));

        const catalog = (catalogResponse?.data?.courses || []).map((course, index) => ({
          ...course,
          id: course._id || course.id,
          _id: course._id || course.id,
          emoji: course.emoji || ['📘', '📐', '🧪', '⚛️'][index % 4],
          gradient: course.gradient || COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
          teacher: typeof course.teacher === 'object' ? course.teacher?.name || 'Instructor' : course.teacher || 'Instructor',
        }));

        setCourses(enrolled);
        setAllCourses(catalog);
        const tests = testsResponse?.data?.tests || [];
        setTeacherTests(tests);
        setSelectedTeacherTest((current) => current || tests[0] || null);
        setNotes((notesResponse?.data?.notes || []).map((note) => ({
          ...note,
          id: note._id || note.id,
        })));

        const videoResponses = await Promise.all(
          enrolled.map((course) => api.get(`/videos/course/${course._id}`).then((response) => ({ courseId: course._id, videos: response?.data?.videos || [] })).catch(() => ({ courseId: course._id, videos: [] })))
        );

        if (!isMounted) return;

        const grouped = {};
        videoResponses.forEach(({ courseId, videos }) => {
          grouped[courseId] = videos.map((video) => ({
            ...video,
            id: video._id || video.id,
            durationLabel: video.duration ? `${Math.floor(Number(video.duration) / 60)}:${String(Number(video.duration) % 60).padStart(2, '0')}` : '0:00',
            watched: Boolean(video.watched || video.completed),
          }));
        });

        setVideosByCourse(grouped);
      } catch (error) {
        console.error('Failed to load student dashboard data:', error);
        setCourses([]);
        setNotes([]);
        setAllCourses([]);
        setVideosByCourse({});
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnrollCourse = async (course) => {
    if (!course?._id) return;
    try {
      setEnrollingCourseId(course._id);
      await api.post(`/courses/${course._id}/enroll`);
      const enrolledResponse = await api.get('/courses/enrolled');
      const enrolled = (enrolledResponse?.data?.courses || []).map((entry, index) => ({
        ...entry,
        id: entry._id || entry.id,
        _id: entry._id || entry.id,
        emoji: entry.emoji || ['📘', '📐', '🧪', '⚛️'][index % 4],
        gradient: entry.gradient || COURSE_GRADIENTS[index % COURSE_GRADIENTS.length],
        teacher: typeof entry.teacher === 'object' ? entry.teacher?.name || 'Instructor' : entry.teacher || 'Instructor',
        progress: Math.min(100, Number(entry.progress || 0) || Math.round((Number(entry.completedLessons || 0) / Math.max(1, Number(entry.totalLessons || 1))) * 100)),
        totalLessons: Number(entry.totalLessons || 0),
        completedLessons: Number(entry.completedLessons || 0),
      }));
      setCourses(enrolled);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const sections = {
    dashboard: <Dashboard user={user} courses={courses} />,
    courses: <MyCourses courses={courses} />,
    notes: <Notes courses={courses} notes={notes} />,
    lectures: <Lectures courses={courses} videosByCourse={videosByCourse} />,
    doubts: <Doubts courses={courses} />,
    ai: <AIAssistant courses={courses} />,
    buy: <BuyCourses user={user} courses={allCourses} onEnroll={handleEnrollCourse} enrollingCourseId={enrollingCourseId} />,
    live: <LiveClasses />,
    mocktests: <MockTestStudio />,
    teacherTests: <TeacherTests courses={courses} teacherTests={teacherTests} />,
  };

  const SB_W = collapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: SB_W, flexShrink: 0,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.22,1,0.36,1)',
        overflow: 'hidden',
        zIndex: 10,
      }}>
        {/* Logo + toggle */}
        <div style={{ padding: collapsed ? '18px 9px' : '18px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
          {!collapsed && (
            <span style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ color: C.violet }}>Learn</span>Sphere
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 4 : 8 }}>
            <button
              onClick={() => dispatch(toggleTheme())}
              title="Toggle theme"
              style={{ width: collapsed ? 22 : 30, height: collapsed ? 22 : 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <span style={{ fontSize: collapsed ? 12 : 13 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <button onClick={() => setCollapsed(v => !v)}
              style={{ width: collapsed ? 22 : 30, height: collapsed ? 22 : 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} size={collapsed ? 12 : 14} color={C.textMid} />
            </button>
          </div>
        </div>

        {/* Profile mini */}
        {!collapsed && (
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={user.name} src={user.avatar} size={36} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.textDim }}>{user.targetExam} · Lv {user.level}</p>
              </div>
            </div>
            {/* XP strip */}
            <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, (user.xp / (user.level * 500)) * 100)}%`, background: 'linear-gradient(90deg,#7C3AED,#0891B2)' }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 9, color: C.textDim }}>{user.xp} / {user.level * 500} XP</p>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'center' }}>
            <Avatar name={user.name} src={user.avatar} size={34} />
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                title={collapsed ? item.label : ''}
                style={{
                  width: '100%', padding: collapsed ? '10px 0' : '9px 12px',
                  borderRadius: 10, border: 'none',
                  background: isActive ? C.violetSoft : 'transparent',
                  display: 'flex', alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 10, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}>
                {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 2, background: C.violet }} />}
                <Icon d={item.icon} size={18} color={isActive ? C.violet : C.textMid} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.violet : C.textMid, whiteSpace: 'nowrap' }}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: streak badge */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => navigate('/student/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'transparent', border: `1px solid ${C.border}`, color: C.textMid, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
            >
              <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.095c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.095 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.095 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.095c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.095c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.095-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.095-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.095z M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" size={14} color={C.textMid} />
              Settings
            </button>
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#FCA5A5', cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
            >
              <Icon d="M15 17h5m-5 0l2-2m-2 2l2 2M8 7H4m0 0l2-2M4 7l2 2" size={14} color="#FCA5A5" />
              Logout
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: C.amberSoft }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.amber }}>{user.streak} day streak</p>
                <p style={{ margin: 0, fontSize: 9, color: C.textDim }}>Keep it going!</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
        {sections[active]}
      </main>

      <style>{`
        @keyframes dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}