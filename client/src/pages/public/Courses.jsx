import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { HiOutlineSearch, HiOutlineStar, HiOutlineUsers, HiOutlinePlay, HiOutlineFilter } from 'react-icons/hi';
import api from '../../services/api';

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay }} className={className}>{children}</motion.div>;
}

const categories = [
  { label: 'All', value: '' },
  { label: 'JEE', value: 'JEE' },
  { label: 'NEET', value: 'NEET' },
  { label: 'CBSE 11', value: 'CBSE11' },
  { label: 'CBSE 12', value: 'CBSE12' },
  { label: 'Bihar Board', value: 'Bihar' },
  { label: 'Jharkhand Board', value: 'Jharkhand' },
  { label: 'Bengal Board', value: 'Bengal' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #3b82f6)',
  'linear-gradient(135deg, #f43f5e, #fb923c)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #10b981, #059669)',
];

const EMOJIS = ['⚛️', '🧬', '📐', '🧪', '🔬', '📊', '⚡', '⚗️', '➗', '📚', '', '💡'];

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

export default function Courses() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;

      const { data } = await api.get('/courses', { params });
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="section relative z-10 text-center pb-8">
          <FadeIn>
            <span className="badge badge-primary mb-4">Explore</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>
              Browse <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Find the perfect course for your exam preparation journey.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search courses, topics, or teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-12 pr-12"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon btn-ghost rounded-lg" style={{ color: 'var(--text-tertiary)' }}>
                <HiOutlineFilter className="w-5 h-5" />
              </button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 mt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeCategory === cat.value ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: activeCategory === cat.value ? 'white' : 'var(--text-secondary)',
                border: activeCategory === cat.value ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No courses found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {activeCategory ? 'No courses in this category yet. Check back soon!' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <FadeIn key={course._id} delay={i * 0.05}>
                <Link to={`/courses/${course._id}`} className="course-card block group">
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden" style={{ background: course.thumbnail ? undefined : GRADIENTS[i % GRADIENTS.length] }}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 dot-pattern opacity-10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl group-hover:scale-110 transition-transform">{EMOJIS[i % EMOJIS.length]}</span>
                        </div>
                      </>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge text-xs font-bold" style={{ background: 'rgba(0,0,0,0.3)', color: 'white', backdropFilter: 'blur(8px)' }}>{course.category}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="badge text-xs" style={{ background: 'rgba(0,0,0,0.3)', color: 'white', backdropFilter: 'blur(8px)' }}>{course.difficulty}</span>
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                        <HiOutlinePlay className="w-6 h-6 text-indigo-600 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h3 className="font-semibold text-base mb-1 font-[Outfit] line-clamp-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{course.teacher?.name || 'Unknown Teacher'}</p>

                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1"><HiOutlineStar className="w-3.5 h-3.5" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} /> {course.rating.toFixed(1)}</span>
                      )}
                      {/* <span className="flex items-center gap-1"><HiOutlineUsers className="w-3.5 h-3.5" /> {course.totalStudents > 999 ? `${(course.totalStudents / 1000).toFixed(1)}k` : course.totalStudents}</span> */}
                      {(() => {
                        const lessonCount = getLessonCount(course);
                        return lessonCount > 0 ? <span className="flex items-center gap-1"><HiOutlinePlay className="w-3.5 h-3.5" /> {lessonCount} lessons</span> : null;
                      })()}
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {course.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>₹{course.discountPrice || course.price}</span>
                        {course.discountPrice && course.discountPrice < course.price && (
                          <span className="text-sm line-through" style={{ color: 'var(--text-tertiary)' }}>₹{course.price}</span>
                        )}
                      </div>
                      {course.discountPrice && course.discountPrice < course.price && (
                        <span className="badge badge-success text-[10px]">{Math.round((1 - course.discountPrice / course.price) * 100)}% off</span>
                      )}
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
