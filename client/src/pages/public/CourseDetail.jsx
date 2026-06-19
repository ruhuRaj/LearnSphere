import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineUsers, HiOutlinePlay, HiOutlineCheckCircle } from 'react-icons/hi';
import api from '../../services/api';

const getLessonCount = (course) => {
  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
  const derivedCount = chapters.reduce((sum, chapter) => {
    const topicCount = Array.isArray(chapter?.topics) ? chapter.topics.length : 0;
    const videoCount = Array.isArray(chapter?.videos) ? chapter.videos.length : 0;
    return sum + topicCount + videoCount;
  }, 0);

  if (derivedCount > 0) return derivedCount;
  if (chapters.length > 0) return chapters.length;

  return Number(course?.totalLessons || 0) > 0 ? Number(course.totalLessons) : 0;
};

const defaultCourse = {
  _id: '0',
  title: 'Course details loading…',
  teacher: { name: 'Expert Teacher' },
  category: 'Course',
  totalStudents: 0,
  rating: 0,
  totalLessons: 0,
  price: 0,
  discountPrice: 0,
  gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)',
  emoji: '📚',
  difficulty: 'Beginner',
  description: 'Loading the latest course details from the server.',
  chapters: [],
  tags: [],
  subjects: [],
  language: 'English',
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(defaultCourse);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('curriculum');

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        if (mounted) {
          setCourse(response?.data?.course || defaultCourse);
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
        if (mounted) {
          setCourse(defaultCourse);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) loadCourse();

    return () => {
      mounted = false;
    };
  }, [id]);

  const courseGradient = course.gradient || 'linear-gradient(135deg, #6366f1, #06b6d4)';
  const lessonsCount = getLessonCount(course);
  const isStudent = user?.role === 'student';
  const isAlreadyEnrolled = Array.isArray(user?.enrolledCourses) && user.enrolledCourses.some((item) => String(item) === String(course?._id));
  const price = Number(course.discountPrice || course.price || 0);
  const originalPrice = Number(course.price || 0);
  const discountPercent = originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in as a student to enroll in this course.');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      toast.error('Only students can enroll in courses.');
      return;
    }

    if (isAlreadyEnrolled) {
      toast('You are already enrolled in this course.');
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/courses/${id}/enroll`);
      toast.success('You are now enrolled in this course.');
      setCourse((prev) => ({ ...prev, totalStudents: (Number(prev?.totalStudents) || 0) + 1 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getCurriculumLabel = (language) => {
    const normalized = (language || 'English').toLowerCase();
    if (normalized === 'hindi') return 'Hindi';
    if (normalized === 'both' || normalized === 'hinglish') return 'Hinglish';
    return 'English';
  };

  const features = [
    `${lessonsCount || 'Live'} Video Lessons`,
    `${getCurriculumLabel(course.language)} Curriculum`,
    ...(course.tags || []).slice(0, 3),
    ...(course.subjects || []).slice(0, 2),
    'AI-Powered Support',
  ].filter(Boolean);

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: courseGradient, minHeight: '340px' }}>
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="section relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-white">
            <div className="flex gap-2 mb-4">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{course.category}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{course.difficulty}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[Outfit] mb-3">{course.title}</h1>
            <p className="text-indigo-100 mb-4 max-w-xl">{course.description || 'A detailed course created by the instructor with structured lessons, live support, and practice resources.'}</p>
            <div className="flex items-center gap-4 text-sm text-indigo-100 mb-6 flex-wrap">
              <span className="flex items-center gap-1"><HiOutlineStar className="w-4 h-4 text-yellow-300" /> {Number(course.rating || 0).toFixed(1)}</span>
              <span className="flex items-center gap-1"><HiOutlineUsers className="w-4 h-4" /> {course.totalStudents || 0} students</span>
              <span className="flex items-center gap-1"><HiOutlinePlay className="w-4 h-4" /> {lessonsCount} lessons</span>
            </div>
            <p className="text-sm text-indigo-200">By <strong className="text-white">{course.teacher?.name || course.teacher || 'Expert Teacher'}</strong></p>
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <div className="glass-card p-6" style={{ background: 'var(--bg-card)' }}>
              <div className="text-center mb-4">
                <span className="text-4xl font-extrabold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>₹{price}</span>
                {originalPrice > 0 && <span className="text-lg line-through ml-2" style={{ color: 'var(--text-tertiary)' }}>₹{originalPrice}</span>}
                {discountPercent > 0 && <div className="badge badge-success mt-2">{discountPercent}% off</div>}
              </div>
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling || isAlreadyEnrolled}
                className="btn btn-primary w-full btn-lg mb-3"
              >
                {enrolling ? 'Enrolling…' : isAlreadyEnrolled ? 'Enrolled' : 'Enroll Now'}
              </button>
              <p className="text-xs text-center mb-3" style={{ color: 'var(--text-tertiary)' }}>Student enrollments are free for now.</p>
              <button className="btn btn-secondary w-full mb-4">Add to Wishlist</button>
              <ul className="space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <HiOutlineCheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          {['curriculum', 'reviews', 'instructor'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 text-sm font-medium rounded-lg capitalize transition-all" style={{ background: activeTab === tab ? 'var(--bg-card)' : 'transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'curriculum' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {(course.chapters || []).length ? (
              (course.chapters || []).map((ch, i) => (
                <div key={ch._id || i} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>{i + 1}</div>
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ch.title}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{(ch.topics || []).length || ch.lessons || 0} lessons/topics</p>
                    </div>
                  </div>
                  <HiOutlinePlay className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))
            ) : (
              <div className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>{loading ? 'Loading course chapters…' : 'No curriculum details are available for this course yet.'}</div>
            )}
          </motion.div>
        )}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-3xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>{Number(course.rating || 0).toFixed(1)}/5</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on {Math.max(1, Math.floor((course.totalStudents || 0) * 0.1))} reviews</p>
          </motion.div>
        )}
        {activeTab === 'instructor' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: courseGradient }}>{course.emoji || '📘'}</div>
            <div>
              <h3 className="font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{course.teacher?.name || course.teacher || 'Expert Teacher'}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{course.teacher?.bio || `Expert educator with 10+ years of experience in ${course.category || 'course'} preparation.`}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
