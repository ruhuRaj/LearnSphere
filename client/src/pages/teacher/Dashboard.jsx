import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlinePlay, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlinePlus, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineLightningBolt, HiArrowRight } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { logout } from '../../features/authSlice';
import { toggleTheme } from '../../features/uiSlice';
import { buildTeacherDashboardData, formatCurrency } from '../../utils/teacherDashboardUtils';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'notes', label: 'Upload Notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'videos', label: 'Upload Videos', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'doubts', label: 'Reply Doubts', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'create-course', label: 'Create Course', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'tests', label: 'Create Test', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'courses', label: 'My Courses', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'live', label: 'Go Online', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const C = {
  bg: 'var(--bg-primary)',
  surface: 'var(--bg-secondary)',
  surfaceHover: 'var(--bg-tertiary)',
  border: 'var(--border-color)',
  text: 'var(--text-primary)',
  textMid: 'var(--text-secondary)',
  textDim: 'var(--text-tertiary)',
  violet: 'var(--primary)',
  cyan: 'var(--secondary)',
  success: 'var(--success, #10b981)',
  amber: 'var(--warning, #f59e0b)',
  red: 'var(--error, #ef4444)',
};

const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={(i === 0 ? '' : 'M') + p} />)}
  </svg>
);

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalStudents: 0, activeCourses: 0, totalLectures: 0, revenue: 0 },
    courseDistribution: [],
    recentDoubts: [],
    myCourses: [],
  });
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', course: '', chapter: '', url: '', duration: 0 });
  const [notesForm, setNotesForm] = useState({ title: '', course: '', chapter: '', content: '', type: 'markdown' });
  const [testForm, setTestForm] = useState({ title: '', course: '', duration: 30, totalMarks: 40, type: 'topic' });
  const [liveForm, setLiveForm] = useState({ title: '', course: '', scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16), duration: 60 });

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        const [coursesResponse, doubtsResponse] = await Promise.all([
          api.get('/courses/my-courses'),
          api.get('/doubts', { params: { limit: 5 } }),
        ]);

        if (!mounted) return;

        const courses = coursesResponse?.data?.courses || [];
        const doubts = doubtsResponse?.data?.doubts || [];

        setTeacherCourses(courses);
        setDashboardData(buildTeacherDashboardData(courses, doubts));
      } catch (error) {
        console.error('Failed to load teacher dashboard data:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (user?.role === 'teacher') {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const submitAction = async (actionType = activeAction) => {
    if (!actionType) return;

    try {
      setActionBusy(true);

      if (actionType === 'video') {
        if (!videoForm.title || !videoForm.course || !videoForm.url) {
          toast.error('Please fill title, course, and video URL');
          return;
        }
        await api.post('/videos', { ...videoForm, duration: Number(videoForm.duration || 0), order: 1 });
        toast.success('Video uploaded successfully');
      }

      if (actionType === 'notes') {
        if (!notesForm.title || !notesForm.course || !notesForm.content) {
          toast.error('Please fill title, course, and note content');
          return;
        }
        await api.post('/notes', { ...notesForm });
        toast.success('Notes saved successfully');
      }

      if (actionType === 'test') {
        if (!testForm.title || !testForm.course) {
          toast.error('Please fill title and course');
          return;
        }
        await api.post('/tests', {
          title: testForm.title,
          course: testForm.course,
          type: testForm.type,
          duration: Number(testForm.duration || 30),
          totalMarks: Number(testForm.totalMarks || 40),
          questions: [
            { text: 'What is the main concept covered in this topic?', type: 'mcq', options: [{ text: 'Concept A', isCorrect: true }, { text: 'Concept B', isCorrect: false }, { text: 'Concept C', isCorrect: false }, { text: 'Concept D', isCorrect: false }], marks: 10 },
          ],
          isAIGenerated: false,
          isPublished: true,
        });
        toast.success('Test created successfully');
      }

      if (actionType === 'live') {
        if (!liveForm.title || !liveForm.course) {
          toast.error('Please fill title and course');
          return;
        }
        await api.post('/live-classes', {
          title: liveForm.title,
          course: liveForm.course,
          scheduledAt: new Date(liveForm.scheduledAt).toISOString(),
          duration: Number(liveForm.duration || 60),
          status: 'scheduled',
          attendeeCount: 0,
        });
        toast.success('Live class scheduled successfully');
      }

      setActiveAction(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionBusy(false);
    }
  };

  const actionButtons = [
    { icon: HiOutlinePlay, label: 'Upload Video', color: '#6366f1', action: () => setActiveAction('video') },
    { icon: HiOutlineDocumentText, label: 'Upload Notes', color: '#06b6d4', action: () => setActiveAction('notes') },
    { icon: HiOutlineLightningBolt, label: 'Create Test', color: '#f59e0b', action: () => setActiveAction('test') },
    { icon: HiOutlineVideoCamera, label: 'Start Live', color: '#ef4444', action: () => setActiveAction('live') },
  ];

  const sectionMap = {
    dashboard: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: dashboardData.stats.totalStudents.toLocaleString(), icon: HiOutlineUsers, color: '#6366f1' },
            { label: 'Active Courses', value: dashboardData.stats.activeCourses, icon: HiOutlineBookOpen, color: '#06b6d4' },
            { label: 'Total Lectures', value: dashboardData.stats.totalLectures, icon: HiOutlinePlay, color: '#10b981' },
            { label: 'Revenue', value: formatCurrency(dashboardData.stats.revenue), icon: HiOutlineChartBar, color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}><stat.icon className="w-5 h-5" style={{ color: stat.color }} /></div><span className="badge badge-success text-[10px]">Live</span></div>
              <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Course Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dashboardData.myCourses.length ? dashboardData.myCourses.map((course) => ({ name: course.title, students: course.students })) : []}>
                <defs><linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="students" stroke="#6366f1" fill="url(#engGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>My Courses</h3><Link to="/teacher/create-course" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Add New</Link></div>
            <div className="space-y-3">
              {dashboardData.myCourses.length ? dashboardData.myCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: course.gradient }}>{course.emoji}</div>
                  <div className="flex-1 min-w-0"><h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h4><p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{course.students} students • ⭐ {course.rating.toFixed(1)}</p></div>
                  <div className="text-right"><div className="text-sm font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(course.revenue)}</div><div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Revenue</div></div>
                </div>
              )) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No courses found yet.</p>}
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Recent Doubts</h3>
            <div className="space-y-3">{dashboardData.recentDoubts.length ? dashboardData.recentDoubts.map((doubt) => <div key={doubt.id} className="flex gap-3 rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--bg-secondary)' }}>{doubt.avatar}</div><div><p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{doubt.question}</p><p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{doubt.studentName} • {doubt.courseTitle}</p></div></div>) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No recent doubts yet.</p>}</div>
          </div>
        </div>
      </div>
    ),
    notes: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Upload Notes</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Attach notes to the course you teach.</p><div className="space-y-3"><input className="input" placeholder="Notes title" value={notesForm.title} onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })} /><select className="input" value={notesForm.course} onChange={(e) => setNotesForm({ ...notesForm, course: e.target.value })}><option value="">Select a course</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><input className="input" placeholder="Chapter name" value={notesForm.chapter} onChange={(e) => setNotesForm({ ...notesForm, chapter: e.target.value })} /><textarea className="input" rows={5} placeholder="Write your notes here" value={notesForm.content} onChange={(e) => setNotesForm({ ...notesForm, content: e.target.value })} /></div><button onClick={() => submitAction('notes')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Saving...' : 'Save Notes'}</button></div>,
    videos: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Upload Video</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Share lectures with your students.</p><div className="space-y-3"><input className="input" placeholder="Video title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} /><select className="input" value={videoForm.course} onChange={(e) => setVideoForm({ ...videoForm, course: e.target.value })}><option value="">Select a course</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><input className="input" placeholder="Chapter name" value={videoForm.chapter} onChange={(e) => setVideoForm({ ...videoForm, chapter: e.target.value })} /><input className="input" placeholder="Video URL (YouTube / MP4)" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} /><input className="input" type="number" placeholder="Duration (seconds)" value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: Number(e.target.value) })} /></div><button onClick={() => submitAction('video')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Uploading...' : 'Upload Video'}</button></div>,
    doubts: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Reply Doubts</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Answer doubts from your students in one place.</p>{dashboardData.recentDoubts.length ? dashboardData.recentDoubts.map((doubt) => <div key={doubt.id} className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-tertiary)' }}><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doubt.question}</p><p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{doubt.studentName} • {doubt.courseTitle}</p><button onClick={() => toast.success('Reply feature ready for integration')} className="btn btn-secondary btn-sm mt-3">Reply</button></div>) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No doubts available yet.</p>}</div>,
    'create-course': <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Create Course</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Set up your next class and publish it instantly.</p><Link to="/teacher/create-course" className="btn btn-primary btn-sm">Open Course Builder</Link></div>,
    tests: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Create Test</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Generate or publish tests for your courses.</p><div className="space-y-3"><input className="input" placeholder="Test title" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} /><select className="input" value={testForm.course} onChange={(e) => setTestForm({ ...testForm, course: e.target.value })}><option value="">Select a course</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><div className="grid grid-cols-2 gap-3"><input className="input" type="number" value={testForm.duration} onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })} placeholder="Duration (min)" /><input className="input" type="number" value={testForm.totalMarks} onChange={(e) => setTestForm({ ...testForm, totalMarks: Number(e.target.value) })} placeholder="Total marks" /></div></div><button onClick={() => submitAction('test')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Creating...' : 'Create Test'}</button></div>,
    courses: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>My Courses</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>All courses created and managed by you.</p><div className="space-y-3">{teacherCourses.length ? teacherCourses.map((course) => <div key={course._id} className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}><h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{course.title}</h3><p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{course.category || 'Course'} • {course.students || 0} learners</p></div>) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No teacher courses found yet.</p>}</div></div>,
    live: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Go Online</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Schedule a live class and start teaching in real time.</p><div className="space-y-3"><input className="input" placeholder="Live class title" value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} /><select className="input" value={liveForm.course} onChange={(e) => setLiveForm({ ...liveForm, course: e.target.value })}><option value="">Select a course</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><input className="input" type="datetime-local" value={liveForm.scheduledAt} onChange={(e) => setLiveForm({ ...liveForm, scheduledAt: e.target.value })} /><input className="input" type="number" value={liveForm.duration} onChange={(e) => setLiveForm({ ...liveForm, duration: Number(e.target.value) })} placeholder="Duration (minutes)" /></div><button onClick={() => submitAction('live')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Scheduling...' : 'Start Live Class'}</button></div>,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <aside style={{ width: collapsed ? 70 : 240, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.22s', overflow: 'hidden' }}>
        <div style={{ padding: collapsed ? '16px 10px' : '16px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
          {!collapsed && <span style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}><span style={{ color: C.violet }}>Teach</span>Sphere</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => dispatch(toggleTheme())} title="Toggle theme" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button onClick={() => setCollapsed(v => !v)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} size={14} color={C.textMid} /></button>
          </div>
        </div>
        {!collapsed && <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 10, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#7C3AED,#0891B2)', color:'#fff', fontWeight:700, fontSize:12 }}>{(user?.name || 'T').split(' ').map((w) => w[0]).join('').slice(0,2).toUpperCase()}</div><div><p style={{ margin:0, fontSize:12, fontWeight:700, color:C.text }}>{user?.name || 'Teacher'}</p><p style={{ margin:0, fontSize:10, color:C.textDim }}>{user?.email || 'teacher@learnsphere.com'}</p></div></div></div>}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, border: 'none', background: active === item.id ? 'rgba(124,58,237,0.12)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
              <Icon d={item.icon} size={18} color={active === item.id ? C.violet : C.textMid} />
              {!collapsed && <span style={{ fontSize: 13, fontWeight: active === item.id ? 700 : 500, color: active === item.id ? C.violet : C.textMid }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {!collapsed && <div style={{ padding: '12px 12px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => navigate('/teacher/profile')} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'transparent', border:`1px solid ${C.border}`, color:C.textMid, cursor:'pointer', fontSize:12, fontWeight:600, textAlign:'left' }}>
            <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.095c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.095 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.095 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.095c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.095c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.095-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.095-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.095z M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" size={14} color={C.textMid} />
            Settings
          </button>
          <button onClick={() => { dispatch(logout()); navigate('/'); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#FCA5A5', cursor:'pointer', fontSize:12, fontWeight:600, textAlign:'left' }}><HiOutlineVideoCamera className="w-4 h-4" /> Logout</button>
        </div>}
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div>
              <p style={{ margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11, color: C.textDim }}>Teacher Area</p>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}>Teacher <span style={{ color: 'var(--primary)' }}>Dashboard</span></h1>
              <p style={{ margin: '6px 0 0', color: C.textMid, fontSize: 13 }}>Manage uploads, tests, doubts, and all courses from one place.</p>
            </div>
            <button onClick={() => setActiveAction('live')} className="btn btn-primary btn-sm">Go Online</button>
          </div>
          {sectionMap[active]}
        </div>
      </main>
    </div>
  );
}
