import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineBookOpen } from 'react-icons/hi';

const courses = [
  { id: 1, title: 'Complete JEE Physics', progress: 65, lessons: 120, completed: 78, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', emoji: '⚛️', teacher: 'Dr. Anita Verma' },
  { id: 2, title: 'JEE Mathematics Pro', progress: 42, lessons: 150, completed: 63, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', emoji: '📐', teacher: 'Rajesh Kumar' },
  { id: 3, title: 'JEE Chemistry Complete', progress: 28, lessons: 130, completed: 36, gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)', emoji: '⚗️', teacher: 'Dr. Kavita Nair' },
];

export default function MyCourses() {
  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>My Courses</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Continue where you left off</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={`/student/learn/${course.id}`} className="course-card block group">
                <div className="relative h-36 flex items-center justify-center" style={{ background: course.gradient }}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{course.emoji}</span>
                </div>
                <div className="card-body">
                  <h3 className="font-semibold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{course.teacher}</p>
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <HiOutlineBookOpen className="w-4 h-4" /> {course.completed}/{course.lessons} lessons
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: course.gradient }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{course.progress}%</span>
                  </div>
                  <button className="btn btn-primary btn-sm w-full mt-4"><HiOutlinePlay className="w-4 h-4" /> Continue</button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
