import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { HiOutlineSearch, HiOutlineStar, HiOutlineUsers, HiOutlinePlay, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay }} className={className}>{children}</motion.div>;
}

const categories = ['All', 'JEE', 'NEET', 'CBSE 11', 'CBSE 12', 'Bihar Board', 'Jharkhand Board', 'Bengal Board'];

const coursesData = [
  { id: 1, title: 'Complete JEE Physics', teacher: 'Dr. Anita Verma', category: 'JEE', students: 12400, rating: 4.9, lessons: 120, price: 2999, discountPrice: 999, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', emoji: '⚛️', difficulty: 'Advanced', tags: ['Physics', 'Mechanics', 'Electrodynamics'] },
  { id: 2, title: 'NEET Biology Mastery', teacher: 'Prof. Meera Shah', category: 'NEET', students: 9800, rating: 4.8, lessons: 95, price: 2499, discountPrice: 799, gradient: 'linear-gradient(135deg, #06b6d4, #10b981)', emoji: '🧬', difficulty: 'Intermediate', tags: ['Biology', 'Botany', 'Zoology'] },
  { id: 3, title: 'JEE Mathematics Pro', teacher: 'Rajesh Kumar', category: 'JEE', students: 11200, rating: 4.9, lessons: 150, price: 3499, discountPrice: 1299, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', emoji: '📐', difficulty: 'Advanced', tags: ['Calculus', 'Algebra', 'Coordinate Geometry'] },
  { id: 4, title: 'CBSE 12 Chemistry', teacher: 'Dr. Sanjay Gupta', category: 'CBSE 12', students: 7500, rating: 4.7, lessons: 80, price: 1999, discountPrice: 699, gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', emoji: '🧪', difficulty: 'Intermediate', tags: ['Organic', 'Inorganic', 'Physical'] },
  { id: 5, title: 'NEET Physics Complete', teacher: 'Amit Singh', category: 'NEET', students: 8200, rating: 4.8, lessons: 110, price: 2999, discountPrice: 999, gradient: 'linear-gradient(135deg, #14b8a6, #3b82f6)', emoji: '🔬', difficulty: 'Advanced', tags: ['Mechanics', 'Optics', 'Modern Physics'] },
  { id: 6, title: 'CBSE 11 Mathematics', teacher: 'Priya Patel', category: 'CBSE 11', students: 6300, rating: 4.6, lessons: 70, price: 1499, discountPrice: 499, gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)', emoji: '📊', difficulty: 'Beginner', tags: ['Sets', 'Trigonometry', 'Statistics'] },
  { id: 7, title: 'Bihar Board Physics', teacher: 'Vikash Yadav', category: 'Bihar Board', students: 4200, rating: 4.5, lessons: 60, price: 999, discountPrice: 399, gradient: 'linear-gradient(135deg, #a855f7, #6366f1)', emoji: '⚡', difficulty: 'Intermediate', tags: ['Class 12 Physics', 'Board Prep'] },
  { id: 8, title: 'JEE Chemistry Complete', teacher: 'Dr. Kavita Nair', category: 'JEE', students: 10500, rating: 4.8, lessons: 130, price: 2999, discountPrice: 1099, gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)', emoji: '⚗️', difficulty: 'Advanced', tags: ['Organic', 'Inorganic', 'Physical Chemistry'] },
  { id: 9, title: 'Jharkhand Board Maths', teacher: 'Suresh Mahto', category: 'Jharkhand Board', students: 3100, rating: 4.4, lessons: 55, price: 799, discountPrice: 299, gradient: 'linear-gradient(135deg, #10b981, #059669)', emoji: '➗', difficulty: 'Beginner', tags: ['Algebra', 'Geometry', 'Board Prep'] },
];

export default function Courses() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = coursesData.filter((c) => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.teacher.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
            <div className="max-w-xl mx-auto relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search courses, topics, or teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-12 pr-12"
              />
              <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon btn-ghost rounded-lg" style={{ color: 'var(--text-tertiary)' }}>
                <HiOutlineFilter className="w-5 h-5" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                border: activeCategory === cat ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No courses found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <FadeIn key={course.id} delay={i * 0.05}>
                <Link to={`/courses/${course.id}`} className="course-card block group">
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden" style={{ background: course.gradient }}>
                    <div className="absolute inset-0 dot-pattern opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl group-hover:scale-110 transition-transform">{course.emoji}</span>
                    </div>
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
                    <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{course.teacher}</p>

                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1"><HiOutlineStar className="w-3.5 h-3.5" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} /> {course.rating}</span>
                      <span className="flex items-center gap-1"><HiOutlineUsers className="w-3.5 h-3.5" /> {(course.students / 1000).toFixed(1)}k</span>
                      <span className="flex items-center gap-1"><HiOutlinePlay className="w-3.5 h-3.5" /> {course.lessons} lessons</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>₹{course.discountPrice}</span>
                        <span className="text-sm line-through" style={{ color: 'var(--text-tertiary)' }}>₹{course.price}</span>
                      </div>
                      <span className="badge badge-success text-[10px]">{Math.round((1 - course.discountPrice / course.price) * 100)}% off</span>
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
