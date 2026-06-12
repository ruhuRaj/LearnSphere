import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineUsers, HiOutlinePlay, HiOutlineClock, HiOutlineCheckCircle, HiOutlineBookOpen, HiOutlineAcademicCap, HiArrowRight } from 'react-icons/hi';

const courseMap = {
  '1': { id: 1, title: 'Complete JEE Physics', teacher: 'Dr. Anita Verma', category: 'JEE', students: 12400, rating: 4.9, lessons: 120, price: 2999, discountPrice: 999, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', emoji: '⚛️', difficulty: 'Advanced', desc: 'Master all JEE Physics concepts from Mechanics to Modern Physics. This comprehensive course covers the entire JEE syllabus with detailed video lectures, practice problems, and AI-powered mock tests.', chapters: [{ title: 'Mechanics', lessons: 25 }, { title: 'Thermodynamics', lessons: 15 }, { title: 'Waves & Optics', lessons: 20 }, { title: 'Electrodynamics', lessons: 30 }, { title: 'Modern Physics', lessons: 15 }, { title: 'Mock Tests & PYQs', lessons: 15 }], features: ['120 HD Video Lectures', 'AI-Generated Mock Tests', 'Previous Year Questions', 'Doubt Solving Support', 'Progress Tracking', 'Certificate on Completion'] },
};

const defaultCourse = { id: 0, title: 'Complete Course', teacher: 'Expert Teacher', category: 'JEE', students: 5000, rating: 4.7, lessons: 80, price: 1999, discountPrice: 699, gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)', emoji: '📚', difficulty: 'Intermediate', desc: 'A comprehensive course designed to help you master every concept. Includes video lectures, practice tests, AI doubt solving, and more.', chapters: [{ title: 'Foundation', lessons: 15 }, { title: 'Core Concepts', lessons: 25 }, { title: 'Advanced Topics', lessons: 20 }, { title: 'Practice & Review', lessons: 20 }], features: ['HD Video Lectures', 'Practice Tests', 'AI Doubt Solver', 'Progress Tracking', 'Certificate', 'Lifetime Access'] };

export default function CourseDetail() {
  const { id } = useParams();
  const course = courseMap[id] || defaultCourse;
  const [activeTab, setActiveTab] = useState('curriculum');

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: course.gradient, minHeight: '340px' }}>
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="section relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-white">
            <div className="flex gap-2 mb-4">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{course.category}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{course.difficulty}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[Outfit] mb-3">{course.title}</h1>
            <p className="text-indigo-100 mb-4 max-w-xl">{course.desc}</p>
            <div className="flex items-center gap-4 text-sm text-indigo-100 mb-6">
              <span className="flex items-center gap-1"><HiOutlineStar className="w-4 h-4 text-yellow-300" /> {course.rating}</span>
              <span className="flex items-center gap-1"><HiOutlineUsers className="w-4 h-4" /> {(course.students / 1000).toFixed(1)}k students</span>
              <span className="flex items-center gap-1"><HiOutlinePlay className="w-4 h-4" /> {course.lessons} lessons</span>
            </div>
            <p className="text-sm text-indigo-200">By <strong className="text-white">{course.teacher}</strong></p>
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="glass-card p-6" style={{ background: 'var(--bg-card)' }}>
              <div className="text-center mb-4">
                <span className="text-4xl font-extrabold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>₹{course.discountPrice}</span>
                <span className="text-lg line-through ml-2" style={{ color: 'var(--text-tertiary)' }}>₹{course.price}</span>
                <div className="badge badge-success mt-2">{Math.round((1 - course.discountPrice / course.price) * 100)}% off</div>
              </div>
              <button className="btn btn-primary w-full btn-lg mb-3">Enroll Now</button>
              <button className="btn btn-secondary w-full mb-4">Add to Wishlist</button>
              <ul className="space-y-2">
                {course.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} /> {f}
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
            {course.chapters.map((ch, i) => (
              <div key={i} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>{i + 1}</div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ch.title}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{ch.lessons} lessons</p>
                  </div>
                </div>
                <HiOutlinePlay className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-3xl font-bold font-[Outfit] mb-2" style={{ color: 'var(--text-primary)' }}>{course.rating}/5</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on {Math.floor(course.students * 0.3)} reviews</p>
          </motion.div>
        )}
        {activeTab === 'instructor' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: course.gradient }}>{course.emoji}</div>
            <div>
              <h3 className="font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{course.teacher}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expert educator with 10+ years of experience in {course.category} preparation.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
