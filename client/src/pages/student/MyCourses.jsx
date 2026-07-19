import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineBookOpen } from 'react-icons/hi2';
import api from '../../services/api';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get('/courses/enrolled');
        setCourses(response?.data?.courses || []);
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);
  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>My Courses</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Continue where you left off</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your enrolled courses…</div>
          ) : courses.length ? (
            courses.map((course, i) => {
              const progress = Math.min(Number(course.progress || 0), 100);
              const completed = Number(course.completedLessons || 0);
              const lessons = Number(course.totalLessons || 0) || 0;
              return (
                <motion.div key={course._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/student/learn/${course._id}`} className="course-card block group">
                    <div className="relative h-36 flex items-center justify-center" style={{ background: course.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <span className="text-5xl group-hover:scale-110 transition-transform">{course.emoji || '📘'}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="font-semibold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{course.teacher?.name || course.teacher || 'Instructor'}</p>
                      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        <HiOutlineBookOpen className="w-4 h-4" /> {completed}/{lessons} lessons
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: course.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{progress}%</span>
                      </div>
                      <button className="btn btn-primary btn-sm w-full mt-4"><HiOutlinePlay className="w-4 h-4" /> Continue</button>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>You are not enrolled in any course yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
