import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlinePlay, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlinePlus, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineLightningBolt, HiArrowRight } from 'react-icons/hi2';
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

const getNoteFileUrl = (note = {}) => {
  const rawValue = note?.fileUrl || note?.secure_url || note?.url || note?.cloudinaryUrl || note?.localPath || '';
  if (!rawValue) return '';
  if (/^https?:\/\//i.test(rawValue)) return rawValue;
  if (rawValue.startsWith('/')) return `${window.location.origin}${rawValue}`;
  return `/${rawValue}`;
};

/* Test History Component with Course Filtering */
const TestsSection = ({ teacherCourses, teacherTests, testForm, testFile, setTestForm, setTestFile, actionBusy, testHistoryCourse, setTestHistoryCourse, loadingTests, submitAction, handleDeleteTest, deletingTestId }) => {
  const filteredTeacherTests = useMemo(() => {
    return teacherTests.filter((test) => {
      const courseId = test.course?._id || test.course;
      const matchesCourse = !testHistoryCourse || courseId === testHistoryCourse;
      return matchesCourse;
    });
  }, [teacherTests, testHistoryCourse]);

  return (
    <div className="space-y-4">
      {/* Create Test Form */}
      <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Create Test</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Upload a PDF question paper or generate through AI for your students to view.</p>
        <div className="space-y-3">
          <input className="input" placeholder="Test title" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} />
          <select className="input" value={testForm.course} onChange={(e) => setTestForm({ ...testForm, course: e.target.value })}>
            <option value="">Select a course</option>
            {teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" value={testForm.questionCount} onChange={(e) => setTestForm({ ...testForm, questionCount: e.target.value })} placeholder="No. of questions" />
            <input className="input" type="number" value={testForm.totalMarks} onChange={(e) => setTestForm({ ...testForm, totalMarks: e.target.value })} placeholder="Total Marks" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" value={testForm.duration} onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })} placeholder="Time (minutes)" />
            <input className="input" placeholder="Topic name" value={testForm.topicName} onChange={(e) => setTestForm({ ...testForm, topicName: e.target.value })} />
          </div>
          <textarea className="input" rows={3} placeholder="AI prompt for question generation (e.g. Create 10 mixed difficulty MCQs on integration for Class 12)" value={testForm.aiPrompt} onChange={(e) => setTestForm({ ...testForm, aiPrompt: e.target.value })} />
          <label className="input" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, cursor: 'pointer' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Upload PDF question paper</span>
            <input type="file" accept="application/pdf" onChange={(e) => setTestFile(e.target.files?.[0] || null)} />
          </label>
          {testFile && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Selected file: {testFile.name}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => submitAction('test')} disabled={actionBusy} className="btn btn-primary btn-sm">{actionBusy ? 'Creating...' : 'Create Test'}</button>
            <button onClick={() => submitAction('test', { generateWithAI: true })} disabled={actionBusy} className="btn btn-ghost btn-sm">{actionBusy ? 'Generating...' : 'Generate through AI'}</button>
          </div>
        </div>
      </div>

      {/* Test History */}
      <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Created test history</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and manage tests created for each course.</p>
          </div>
          {loadingTests && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading…</span>}
        </div>

        {/* Course Filter */}
        <select className="input mb-4" value={testHistoryCourse} onChange={(e) => setTestHistoryCourse(e.target.value)}>
          <option value="">All courses</option>
          {teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
        </select>

        {/* Tests Grid */}
        {loadingTests ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your tests...</p>
        ) : filteredTeacherTests.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeacherTests.map((test) => (
              <div key={test._id} className="rounded-2xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{test.title || 'Untitled Test'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{test.topicName || 'Topic'}</p>
                  </div>
                  <span className="badge badge-outline text-[10px]" style={{ color: 'var(--primary)' }}>{test.duration || 0} min</span>
                </div>
                <div className="text-[11px] space-y-1 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <p>Questions: {test.questionCount || 0}</p>
                  <p>Marks: {test.totalMarks || 0}</p>
                  <p>Date: {new Date(test.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(test.pdfUrl || test.pdfLocalPath) ? (
                    <a href={test.pdfUrl || test.pdfLocalPath} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm flex-1">
                      View PDF
                    </a>
                  ) : (
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>No PDF uploaded</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteTest(test._id || test.id)}
                    className="btn btn-error btn-sm"
                    disabled={deletingTestId === (test._id || test.id)}
                  >
                    {deletingTestId === (test._id || test.id) ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tests created yet. Create your first test above.</p>
        )}
      </div>
    </div>
  );
};

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [videoForm, setVideoForm] = useState({ title: '', course: '', chapter: '', url: '', duration: 'duration' });
  const [videoFile, setVideoFile] = useState(null);
  const [notesForm, setNotesForm] = useState({ title: '', course: '', chapter: '', subject: '', content: '', type: 'markdown' });
  const [notesFile, setNotesFile] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [teacherVideos, setTeacherVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [teacherLiveClasses, setTeacherLiveClasses] = useState([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(false);
  const [activeLiveClass, setActiveLiveClass] = useState(null);
  const [videoHistoryCourse, setVideoHistoryCourse] = useState('');
  const [videoHistoryChapter, setVideoHistoryChapter] = useState('');
  const [noteHistoryCourse, setNoteHistoryCourse] = useState('');
  const [noteHistoryChapter, setNoteHistoryChapter] = useState('');
  const [testForm, setTestForm] = useState({ title: '', course: '', duration: "", totalMarks: "", type: 'topic', questionCount: "", topicName: '', aiPrompt: '' });
  const [testFile, setTestFile] = useState(null);
  const [teacherTests, setTeacherTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [testHistoryCourse, setTestHistoryCourse] = useState('');
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [liveForm, setLiveForm] = useState({ title: '', course: '', scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16)});
  const [allDoubts, setAllDoubts] = useState([]);
  const [doubtReplyDrafts, setDoubtReplyDrafts] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [busyReplyId, setBusyReplyId] = useState(null);

  const sectionPaths = {
    dashboard: '/teacher/dashboard',
    notes: '/teacher/notes',
    videos: '/teacher/videos',
    doubts: '/teacher/doubts',
    'create-course': '/teacher/create-course',
    tests: '/teacher/tests',
    courses: '/teacher/courses',
    live: '/teacher/live',
  };

  const getJitsiUrl = (liveClass) => {
    const room = liveClass?.roomId || `learn-sphere-live-${liveClass?._id || Date.now()}`;
    return `https://meet.jit.si/${encodeURIComponent(room)}`;
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [coursesResponse, doubtsResponse] = await Promise.all([
        api.get('/courses/my-courses'),
        api.get('/doubts', { params: { limit: 50 } }),
      ]);

      const courses = coursesResponse?.data?.courses || [];
      const doubts = doubtsResponse?.data?.doubts || [];

      setTeacherCourses(courses);
      setAllDoubts(doubts);
      setDashboardData(buildTeacherDashboardData(courses, doubts));
    } catch (error) {
      console.error('Failed to load teacher dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeacherNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await api.get('/notes');
      setTeacherNotes(response?.data?.notes?.map((note) => ({ ...note, id: note._id || note.id })) || []);
    } catch (error) {
      console.error('Failed to load teacher notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadTeacherTests = async () => {
    try {
      setLoadingTests(true);
      const response = await api.get('/tests/my-tests');
      setTeacherTests(response?.data?.tests?.map((test) => ({ ...test, id: test._id || test.id })) || []);
    } catch (error) {
      console.error('Failed to load teacher tests:', error);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    const confirmDelete = window.confirm('Delete this test and its PDF?');
    if (!confirmDelete) return;

    try {
      setDeletingTestId(testId);
      await api.delete(`/tests/${testId}`);
      toast.success('Test deleted successfully');
      await loadTeacherTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error(error.response?.data?.message || 'Could not delete test');
    } finally {
      setDeletingTestId(null);
    }
  };

  const loadTeacherVideos = async (courses = teacherCourses) => {
    try {
      setLoadingVideos(true);
      const courseList = (courses || []).filter((course) => course?._id || course?.id);
      const videoResponses = await Promise.all(
        courseList.map((course) => api.get(`/videos/course/${course._id || course.id}`).then((response) => ({ courseId: course._id || course.id, videos: response?.data?.videos || [] })).catch(() => ({ courseId: course._id || course.id, videos: [] })))
      );
      const allVideos = videoResponses.flatMap(({ videos }) => videos.map((video) => ({ ...video, id: video._id || video.id })));
      setTeacherVideos(allVideos);
      if (!videoHistoryCourse && courseList.length) {
        setVideoHistoryCourse(courseList[0]._id || courseList[0].id);
      }
    } catch (error) {
      console.error('Failed to load teacher videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadTeacherLiveClasses = async () => {
    try {
      setLoadingLiveClasses(true);
      const { data } = await api.get('/live-classes');
      const classes = data.classes || [];
      setTeacherLiveClasses(classes);
      const active = classes.find((cls) => cls.status === 'live');
      setActiveLiveClass(active || null);
    } catch (error) {
      console.error('Failed to load teacher live classes:', error);
    } finally {
      setLoadingLiveClasses(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const didConfirm = window.confirm('Delete this note from your uploads?');
    if (!didConfirm) return;

    try {
      setDeletingNoteId(noteId);
      await api.delete(`/notes/${noteId}`);
      await loadTeacherNotes();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error(error.response?.data?.message || 'Could not delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    const didConfirm = window.confirm('Delete this video from your uploads?');
    if (!didConfirm) return;

    try {
      setDeletingVideoId(videoId);
      await api.delete(`/videos/${videoId}`);
      await loadTeacherVideos(teacherCourses);
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error(error.response?.data?.message || 'Could not delete video');
    } finally {
      setDeletingVideoId(null);
    }
  };

  const startLiveClass = async (classId) => {
    try {
      setActionBusy(true);
      const { data } = await api.put(`/live-classes/${classId}/start`);
      toast.success('Live class started successfully');
      setActiveLiveClass(data.liveClass || null);
      await loadTeacherLiveClasses();
    } catch (error) {
      console.error('Failed to start live class:', error);
      toast.error(error.response?.data?.message || 'Could not start class');
    } finally {
      setActionBusy(false);
    }
  };

  const endLiveClass = async (classId) => {
    try {
      setActionBusy(true);
      await api.put(`/live-classes/${classId}/end`);
      toast.success('Live class ended successfully');
      setActiveLiveClass(null);
      await loadTeacherLiveClasses();
    } catch (error) {
      console.error('Failed to end live class:', error);
      toast.error(error.response?.data?.message || 'Could not end class');
    } finally {
      setActionBusy(false);
    }
  };

  useEffect(() => {
    const pathSegment = location.pathname.replace(/^\/teacher\/?/, '').split('/')[0] || 'dashboard';
    const mappedSection = {
      dashboard: 'dashboard',
      notes: 'notes',
      videos: 'videos',
      doubts: 'doubts',
      'create-course': 'create-course',
      tests: 'tests',
      courses: 'courses',
      live: 'live',
    }[pathSegment] || 'dashboard';
    setActive(mappedSection);
  }, [location.pathname]);

  useEffect(() => {
    if (teacherCourses.length) {
      loadTeacherVideos(teacherCourses);
    }
  }, [teacherCourses]);

  useEffect(() => {
    let mounted = true;

    if (user?.role === 'teacher') {
      loadDashboardData();
      loadTeacherNotes();
      loadTeacherTests();
      loadTeacherLiveClasses();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleReplySubmit = async (doubtId) => {
    const replyText = (doubtReplyDrafts[doubtId] || '').trim();
    if (!replyText) {
      toast.error('Please enter a reply before submitting.');
      return;
    }

    try {
      setBusyReplyId(doubtId);
      await api.post(`/doubts/${doubtId}/reply`, { text: replyText });
      setDoubtReplyDrafts((prev) => ({ ...prev, [doubtId]: '' }));
      setReplyingId(null);
      await loadDashboardData();
      toast.success('Doubt replied successfully');
    } catch (error) {
      console.error('Reply submission failed:', error);
      toast.error(error.response?.data?.message || 'Failed to send reply.');
    } finally {
      setBusyReplyId(null);
    }
  };

  const submitAction = async (actionType = activeAction, options = {}) => {
    if (!actionType) return;

    try {
      setActionBusy(true);

      if (actionType === 'video') {
        if (!videoForm.title || !videoForm.course || (!videoForm.url && !videoFile)) {
          toast.error('Please fill title, course, and video URL or upload a video file');
          return;
        }

        try {
          if (videoFile) {
            const formData = new FormData();
            formData.append('title', videoForm.title);
            formData.append('course', videoForm.course);
            formData.append('chapter', videoForm.chapter);
            formData.append('duration', String(videoForm.duration || 0));
            formData.append('description', videoForm.description || '');
            formData.append('isPublished', 'true');
            formData.append('file', videoFile);
            await api.post('/videos', formData);
          } else {
            await api.post('/videos', { ...videoForm, duration: Number(videoForm.duration || 0), order: 1, isPublished: true });
          }

          setVideoForm({ title: '', course: '', chapter: '', url: '', duration: 0 });
          setVideoFile(null);
          await loadTeacherVideos(teacherCourses);
          toast.success('Video uploaded successfully');
        } catch (e) {
          throw e;
        }
      }

      if (actionType === 'notes') {
        if (!notesForm.title || !notesForm.course || (!notesForm.content && !notesFile)) {
          toast.error('Please fill title, course, and note content or upload a PDF');
          return;
        }

        const formData = new FormData();
        formData.append('title', notesForm.title);
        formData.append('course', notesForm.course);
        formData.append('chapter', notesForm.chapter);
        formData.append('subject', notesForm.subject);
        formData.append('content', notesForm.content);
        formData.append('type', notesFile ? 'pdf' : notesForm.type || 'markdown');
        if (notesFile) {
          formData.append('file', notesFile);
        }

        await api.post('/notes', formData);
        setNotesFile(null);
        setNotesForm({ title: '', course: '', chapter: '', subject: '', content: '', type: 'markdown' });
        await loadTeacherNotes();
        toast.success('Notes saved successfully');
      }

      if (actionType === 'test') {
        if (!testForm.title || !testForm.course) {
          toast.error('Please fill title and course');
          return;
        }

        const shouldGenerateWithAI = Boolean(options.generateWithAI);
        if (shouldGenerateWithAI && !testForm.aiPrompt?.trim() && !testForm.topicName?.trim()) {
          toast.error('Please enter an AI prompt or topic name');
          return;
        }

        const formData = new FormData();
        formData.append('title', testForm.title);
        formData.append('course', testForm.course);
        formData.append('duration', Number(testForm.duration || 30));
        formData.append('totalMarks', Number(testForm.totalMarks || 40));
        formData.append('questionCount', Number(testForm.questionCount || 0));
        formData.append('topicName', testForm.topicName || '');
        formData.append('aiPrompt', testForm.aiPrompt || '');
        formData.append('generateWithAI', shouldGenerateWithAI ? 'true' : 'false');
        formData.append('type', testForm.type || 'topic');
        formData.append('isPublished', 'true');

        if (testFile && !shouldGenerateWithAI) {
          formData.append('file', testFile);
        }

        await api.post('/tests', formData);
        setTestForm({ title: '', course: '', duration: 30, totalMarks: 40, type: 'topic', questionCount: 0, topicName: '', aiPrompt: '' });
        setTestFile(null);
        await loadTeacherTests();
        toast.success(shouldGenerateWithAI ? 'AI-generated PDF test created successfully' : 'Test created successfully');
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
        await loadTeacherLiveClasses();
      }

      setActiveAction(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionBusy(false);
    }
  };

  const filteredTeacherVideos = useMemo(() => {
    return teacherVideos.filter((video) => {
      const courseId = video.course?._id || video.course;
      const matchesCourse = !videoHistoryCourse || courseId === videoHistoryCourse;
      const matchesChapter = !videoHistoryChapter || (video.chapter || 'General') === videoHistoryChapter;
      return matchesCourse && matchesChapter;
    });
  }, [teacherVideos, videoHistoryCourse, videoHistoryChapter]);

  const availableVideoChapters = useMemo(() => {
    const chapters = teacherVideos
      .filter((video) => !videoHistoryCourse || (video.course?._id || video.course) === videoHistoryCourse)
      .map((video) => video.chapter || 'General');
    return [...new Set(chapters)];
  }, [teacherVideos, videoHistoryCourse]);

  const filteredTeacherNotes = useMemo(() => {
    return teacherNotes.filter((note) => {
      const courseId = note.course?._id || note.course;
      const chapterLabel = note.chapter || note.subject || 'General';
      const matchesCourse = !noteHistoryCourse || courseId === noteHistoryCourse;
      const matchesChapter = !noteHistoryChapter || chapterLabel === noteHistoryChapter;
      return matchesCourse && matchesChapter;
    });
  }, [teacherNotes, noteHistoryCourse, noteHistoryChapter]);

  const availableNoteChapters = useMemo(() => {
    const chapters = teacherNotes
      .filter((note) => !noteHistoryCourse || (note.course?._id || note.course) === noteHistoryCourse)
      .map((note) => note.chapter || note.subject || 'General');
    return [...new Set(chapters)];
  }, [teacherNotes, noteHistoryCourse]);

  const handleSectionChange = (sectionId) => {
    const targetPath = sectionPaths[sectionId] || '/teacher/dashboard';
    setActive(sectionId);
    navigate(targetPath);
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
            <div className="space-y-3">
              {dashboardData.recentDoubts.length ? (
                dashboardData.recentDoubts.map((doubt) => (
                  <div key={doubt.id} className="flex gap-3 rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs" style={{ background: 'var(--bg-secondary)' }}>
                      {doubt.avatar && (String(doubt.avatar).startsWith('http') || String(doubt.avatar).includes('/')) ? (
                        <img src={doubt.avatar} alt={doubt.studentName || 'avatar'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs truncate" style={{ padding: 2 }}>{doubt.avatar || (doubt.studentName ? doubt.studentName.charAt(0) : '?')}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{doubt.question}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{doubt.studentName} • {doubt.courseTitle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No recent doubts yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    notes: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Upload Notes</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Attach notes to the course you teach. You can upload lesson/topic-wise PDF notes or add markdown notes, and manage your upload history below.</p><div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-3">
          <input className="input" placeholder="Notes title" value={notesForm.title} onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })} />
          <select className="input" value={notesForm.course} onChange={(e) => setNotesForm({ ...notesForm, course: e.target.value })}>
            <option value="">Select a course</option>
            {teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
          <input className="input" placeholder="Lesson / Chapter name" value={notesForm.chapter} onChange={(e) => setNotesForm({ ...notesForm, chapter: e.target.value })} />
          <input className="input" placeholder="Topic / Subject" value={notesForm.subject} onChange={(e) => setNotesForm({ ...notesForm, subject: e.target.value })} />
          <textarea className="input" rows={4} placeholder="Write a summary or notes description" value={notesForm.content} onChange={(e) => setNotesForm({ ...notesForm, content: e.target.value })} />
          <label className="input" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, cursor: 'pointer' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Upload PDF file (optional)</span>
            <input type="file" accept="application/pdf" onChange={(e) => setNotesFile(e.target.files?.[0] || null)} />
          </label>
          {notesFile && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Selected file: {notesFile.name}</p>}
          <button onClick={() => submitAction('notes')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Saving...' : 'Save Notes'}</button>
        </div>

        <div className="space-y-4" style={{ minHeight: 420 }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Uploaded Notes</h3>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{loadingNotes ? 'Refreshing…' : `${teacherNotes.length} items`}</span>
            </div>
            <select className="input" value={noteHistoryCourse} onChange={(e) => { setNoteHistoryCourse(e.target.value); setNoteHistoryChapter(''); }}>
              <option value="">All courses</option>
              {teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
            </select>
            {availableNoteChapters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableNoteChapters.map((chapter) => (
                  <button
                    key={chapter}
                    onClick={() => setNoteHistoryChapter(chapter === 'General' ? '' : chapter)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      borderColor: (noteHistoryChapter || 'General') === chapter ? 'var(--primary)' : 'var(--border-color)',
                      color: (noteHistoryChapter || 'General') === chapter ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            )}
            {loadingNotes ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your notes...</p>
            ) : filteredTeacherNotes.length ? (
              <div className="space-y-3">
                {filteredTeacherNotes.map((note) => {
                  const noteFileUrl = getNoteFileUrl(note);
                  return (
                    <div key={note.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{note.title || 'Untitled note'}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{note.course?.title || note.course || 'Unknown course'} • {note.chapter || note.subject || 'General'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{new Date(note.createdAt).toLocaleDateString('en-IN')}</p>
                          <span className="badge badge-outline text-[10px]" style={{ color: noteFileUrl ? 'var(--success)' : 'var(--primary)' }}>{noteFileUrl ? 'PDF' : 'Markdown'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-3">
                        {noteFileUrl ? (
                          <a href={noteFileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open PDF</a>
                        ) : (
                          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>No file attached</span>
                        )}
                        <button onClick={() => handleDeleteNote(note.id)} disabled={deletingNoteId === note.id} className="btn btn-error btn-sm">
                          {deletingNoteId === note.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No uploaded notes yet. Your uploaded PDFs and summaries will appear here.</p>
            )}
          </div>
        </div>
      </div></div>,
    videos: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
    <h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Upload Video</h2>
    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Share lectures with your students. Upload a direct video URL or a YouTube link and keep a history below.</p>
    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6"><div className="space-y-3"><input className="input" placeholder="Video title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
    <select className="input" value={videoForm.course} onChange={(e) => setVideoForm({ ...videoForm, course: e.target.value })}>
    <option value="">Select a course</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select>
    <input className="input" placeholder="Chapter name" value={videoForm.chapter} onChange={(e) => setVideoForm({ ...videoForm, chapter: e.target.value })} />
    <input className="input" placeholder="Video URL (YouTube / MP4)" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} />
    <label className="input" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, cursor: 'pointer' }}><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Upload a Video</span>
    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} /></label>{videoFile && 
    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Selected file: {videoFile.name}</p>}
    <input className="input" type="number" placeholder="Duration (seconds)" value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: Number(e.target.value) })} />
    <button onClick={() => submitAction('video')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Uploading...' : 'Upload Video'}</button></div>
    <div className="space-y-4" style={{ minHeight: 420 }}><div className="flex items-center justify-between mb-3"><h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Uploaded Videos</h3>
    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{loadingVideos ? 'Refreshing…' : `${teacherVideos.length} items`}</span></div><select className="input" value={videoHistoryCourse} onChange={(e) => { setVideoHistoryCourse(e.target.value); setVideoHistoryChapter(''); }}>
    <option value="">All courses</option>{teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
    </select>{availableVideoChapters.length > 0 && <div className="flex flex-wrap gap-2">{availableVideoChapters.map((chapter) => <button key={chapter} onClick={() => setVideoHistoryChapter(chapter === 'General' ? '' : chapter)} className="btn btn-ghost btn-sm" style={{ borderColor: (videoHistoryChapter || 'General') === chapter ? 'var(--primary)' : 'var(--border-color)', color: (videoHistoryChapter || 'General') === chapter ? 'var(--primary)' : 'var(--text-secondary)' }}>{chapter}</button>)}</div>}
    {loadingVideos ? <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your videos...</p> : filteredTeacherVideos.length ? <div className="space-y-3">{filteredTeacherVideos.map((video) => <div key={video.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{video.title || 'Untitled video'}</p>
    <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{video.chapter || 'General'} • {new Date(video.createdAt).toLocaleDateString('en-IN')}</p></div>
    <span className="badge badge-outline text-[10px]" style={{ color: 'var(--success)' }}>Video</span></div><div className="flex items-center justify-between gap-3 mt-3"><a href={video.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open Link</a>
    <button onClick={() => handleDeleteVideo(video.id)} disabled={deletingVideoId === video.id} className="btn btn-error btn-sm">{deletingVideoId === video.id ? 'Deleting…' : 'Delete'}</button></div></div>)}</div> : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No videos for this course yet. Uploaded videos will appear here.</p>}</div></div></div>,
    doubts: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
      <h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Reply Doubts</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Answer doubts from your students in one place.</p>
      {allDoubts.length ? allDoubts.map((doubt) => (
        <div key={doubt._id} className="rounded-xl p-4 mb-3" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doubt.question}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{doubt.student?.name || 'Student'} • {doubt.course?.title || 'General'}</p>
            </div>
            <span className="badge badge-outline text-[10px]" style={{ color: doubt.status === 'answered' ? 'var(--success)' : doubt.status === 'resolved' ? 'var(--secondary)' : 'var(--primary)' }}>{doubt.status || 'open'}</span>
          </div>

          {doubt.replies?.length > 0 && (
            <div className="mt-3 space-y-2">
              {doubt.replies.map((reply) => (
                <div key={reply._id || reply.createdAt} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{reply.text}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{reply.role === 'teacher' ? 'Teacher reply' : 'AI reply'}</p>
                </div>
              ))}
            </div>
          )}

          {replyingId === doubt._id ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={doubtReplyDrafts[doubt._id] || ''}
                onChange={(e) => setDoubtReplyDrafts((prev) => ({ ...prev, [doubt._id]: e.target.value }))}
                rows={3}
                placeholder="Write your reply..."
                className="input w-full"
              />
              <div className="flex items-center gap-2">
                <button onClick={() => handleReplySubmit(doubt._id)} disabled={busyReplyId === doubt._id} className="btn btn-primary btn-sm">
                  {busyReplyId === doubt._id ? 'Sending...' : 'Send Reply'}
                </button>
                <button onClick={() => setReplyingId(null)} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setReplyingId(doubt._id)} className="btn btn-secondary btn-sm mt-4">Reply</button>
          )}
        </div>
      )) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No doubts available yet.</p>}
    </div>,
    'create-course': null,
    tests: <TestsSection teacherCourses={teacherCourses} teacherTests={teacherTests} testForm={testForm} testFile={testFile} setTestForm={setTestForm} setTestFile={setTestFile} actionBusy={actionBusy} testHistoryCourse={testHistoryCourse} setTestHistoryCourse={setTestHistoryCourse} loadingTests={loadingTests} submitAction={submitAction} handleDeleteTest={handleDeleteTest} deletingTestId={deletingTestId} />,
    courses: <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>My Courses</h2><p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>All courses created and managed by you.</p><div className="space-y-3">{teacherCourses.length ? teacherCourses.map((course) => {
      const learners = Number(course.totalStudents) || 0;
      return (
        <div key={course._id} className="rounded-3xl p-5 border border-transparent hover:border-violet-300 transition duration-200" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
              <p className="text-[11px] uppercase tracking-[0.18em] mt-1" style={{ color: 'var(--secondary)' }}>{course.category || 'Course'}</p>
            </div>
            <span className="badge badge-outline text-[11px]" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>{learners} learner{learners === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {learners > 0 ? `${learners.toLocaleString()} enrolled learner${learners === 1 ? '' : 's'}` : 'No learners yet, share your course to start enrolling.'}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)' }}>
              <HiOutlineUsers className="w-4 h-4" />
              <span className="text-xs font-semibold">{learners.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <span>{course.totalLessons || 0} lessons</span>
            <span>★ {Number(course.rating || 0).toFixed(1)}</span>
          </div>
        </div>
      );
    }) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No teacher courses found yet.</p>}</div></div>,
    live: <div className="space-y-6">
      <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-xl font-semibold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>Go Online</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Schedule a live class for your students from here.</p>
        <div className="space-y-3">
          <input className="input" placeholder="Live class title" value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} />
          <select className="input" value={liveForm.course} onChange={(e) => setLiveForm({ ...liveForm, course: e.target.value })}>
            <option value="">Select a course</option>
            {teacherCourses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
          <input className="input" type="datetime-local" value={liveForm.scheduledAt} onChange={(e) => setLiveForm({ ...liveForm, scheduledAt: e.target.value })} />
          <input className="input" type="number" value={liveForm.duration} onChange={(e) => setLiveForm({ ...liveForm, duration: Number(e.target.value) })} placeholder="Duration (minutes)" />
        </div>
        <button onClick={() => submitAction('live')} disabled={actionBusy} className="btn btn-primary btn-sm mt-3">{actionBusy ? 'Scheduling...' : 'Schedule Live Class'}</button>
      </div>

      <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Scheduled classes</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage upcoming and live sessions for your courses.</p>
          </div>
          {loadingLiveClasses && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading…</span>}
        </div>
        {activeLiveClass && (
          <>
            <div className="glass-card p-4 rounded-3xl border border-red-300 mb-4" style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#fca5a5' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{activeLiveClass.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Live now • {activeLiveClass.duration || 60} mins</p>
                </div>
                <button onClick={() => endLiveClass(activeLiveClass._id)} disabled={actionBusy} className="btn btn-error btn-sm">{actionBusy ? 'Ending...' : 'End Class'}</button>
              </div>
            </div>

            <div className="glass-card p-4 rounded-3xl border border-red-300 mb-4" style={{ background: 'rgba(15,23,42,0.95)', borderColor: '#fca5a5' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Teacher live room</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Use the embedded Jitsi session to teach live and support student join requests.</p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>Room ID: <strong>{activeLiveClass.roomId}</strong></p>
                </div>
                <a href={getJitsiUrl(activeLiveClass)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open in new tab</a>
              </div>
              <div style={{ aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
                <iframe
                  title={`Teacher session ${activeLiveClass.title}`}
                  src={getJitsiUrl(activeLiveClass)}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </div>
          </>
        )}
        <div className="space-y-3">
          {teacherLiveClasses.filter((cls) => cls.status !== 'ended').length ? teacherLiveClasses.filter((cls) => cls.status !== 'ended').map((cls) => (
            <div key={cls._id} className="rounded-3xl p-4 border border-transparent hover:border-violet-300 transition duration-200" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cls.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{cls.course?.title || 'No course selected'}</p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>{new Date(cls.scheduledAt).toLocaleString()}</p>
                </div>
                <span className="badge badge-outline text-[11px]" style={{ color: cls.status === 'live' ? '#ef4444' : '#6366f1', borderColor: cls.status === 'live' ? '#ef4444' : '#6366f1' }}>{cls.status === 'live' ? 'LIVE' : 'Scheduled'}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Duration: {cls.duration || 60} mins</p>
                {cls.status === 'scheduled' && (
                  <button onClick={() => startLiveClass(cls._id)} disabled={actionBusy} className="btn btn-primary btn-sm">{actionBusy ? 'Starting...' : 'Start Now'}</button>
                )}
                {cls.status === 'live' && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-outline text-[11px]" style={{ color: '#10b981', borderColor: '#10b981' }}>Students can join now</span>
                    <button onClick={() => endLiveClass(cls._id)} disabled={actionBusy} className="btn btn-error btn-sm">{actionBusy ? 'Ending...' : 'End Class'}</button>
                  </div>
                )}
              </div>
            </div>
          )) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No live or upcoming classes found yet.</p>}
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Live class history</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review completed sessions for each course.</p>
          </div>
        </div>
        <div className="space-y-3">
          {teacherLiveClasses.filter((cls) => cls.status === 'ended').length ? teacherLiveClasses.filter((cls) => cls.status === 'ended').map((cls) => (
            <div key={cls._id} className="rounded-3xl p-4 border border-transparent hover:border-violet-300 transition duration-200" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cls.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{cls.course?.title || 'No course selected'}</p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>{new Date(cls.scheduledAt).toLocaleString()}</p>
                </div>
                <span className="badge badge-outline text-[11px]" style={{ color: '#10b981', borderColor: '#10b981' }}>Ended</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Attendees: {cls.attendeeCount || 0}</p>
                {cls.recordingUrl && <a href={cls.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View Recording</a>}
              </div>
            </div>
          )) : <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No completed live classes yet.</p>}
        </div>
      </div>
    </div>,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <aside style={{ width: collapsed ? 70 : 240, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', transition: 'width 0.22s', overflow: 'hidden' }}>
        <div style={{ padding: collapsed ? '16px 9px' : '16px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
          {!collapsed && <span style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}><span style={{ color: C.violet }}>Learn</span>Sphere</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 4 : 8 }}>
            <button onClick={() => dispatch(toggleTheme())} title="Toggle theme" style={{ width: collapsed ? 22 : 30, height: collapsed ? 22 : 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: collapsed ? 12 : 13 }}>{theme === 'dark' ? '☀️' : '🌙'}</span></button>
            <button onClick={() => setCollapsed(v => !v)} style={{ width: collapsed ? 22 : 30, height: collapsed ? 22 : 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} size={collapsed ? 12 : 14} color={C.textMid} /></button>
          </div>
        </div>
        {!collapsed && (
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Teacher'}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg,#7C3AED,#0891B2)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {(user?.name || 'T')
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.text }}>
                  {user?.name || 'Teacher'}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: C.textDim }}>
                  {user?.email || 'teacher@learnsphere.com'}
                </p>
              </div>
            </div>
          </div>
        )}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => (
            <button key={item.id} onClick={() => handleSectionChange(item.id)} style={{ width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, border: 'none', background: active === item.id ? 'rgba(124,58,237,0.12)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
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
          {active === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <div>
                <p style={{ margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11, color: C.textDim }}>Teacher Area</p>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text, fontFamily: 'Outfit, system-ui, sans-serif' }}>Teacher <span style={{ color: 'var(--primary)' }}>Dashboard</span></h1>
                <p style={{ margin: '6px 0 0', color: C.textMid, fontSize: 13 }}>Manage uploads, tests, doubts, and all courses from one place.</p>
              </div>
              <button onClick={() => handleSectionChange('live')} className="btn btn-primary btn-sm">Go Online</button>
            </div>
          )}
          {sectionMap[active]}
        </div>
      </main>
    </div>
  );
}
