import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCheckCircle, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const coursesData = [
  { id: 1, title: 'Advanced Organic Chemistry', teacher: 'Dr. Kavita Nair', category: 'NEET', status: 'pending', submitted: '2026-05-25', students: 0, price: '₹2,499', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { id: 2, title: 'Calculus Mastery', teacher: 'Rajesh Kumar', category: 'JEE', status: 'pending', submitted: '2026-05-24', students: 0, price: '₹1,999', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 3, title: 'Complete JEE Physics', teacher: 'Dr. Anita Verma', category: 'JEE', status: 'approved', submitted: '2026-01-15', students: 12400, price: '₹999', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { id: 4, title: 'NEET Biology Mastery', teacher: 'Prof. Meera Shah', category: 'NEET', status: 'approved', submitted: '2026-02-01', students: 9800, price: '₹799', gradient: 'linear-gradient(135deg, #06b6d4, #10b981)' },
  { id: 5, title: 'Bihar Board Mathematics', teacher: 'Suresh Mahto', category: 'Bihar Board', status: 'rejected', submitted: '2026-05-20', students: 0, price: '₹499', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
];

export default function CourseApproval() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState(coursesData);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.teacher.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, status) => {
    setCourses(courses.map((c) => c.id === id ? { ...c, status } : c));
    toast.success(`Course ${status}!`);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>Course Management</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Review and approve course submissions</p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              <input className="input pl-10" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all" style={{
                  background: statusFilter === s ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: statusFilter === s ? 'white' : 'var(--text-secondary)'
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: courses.length, color: '#6366f1' },
              { label: 'Pending', value: courses.filter((c) => c.status === 'pending').length, color: '#f59e0b' },
              { label: 'Approved', value: courses.filter((c) => c.status === 'approved').length, color: '#10b981' },
              { label: 'Rejected', value: courses.filter((c) => c.status === 'rejected').length, color: '#ef4444' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center py-3">
                <div className="text-xl font-bold font-[Outfit]" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Course Cards */}
          <div className="space-y-4">
            {filtered.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: course.gradient }}>
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>by {course.teacher} • {course.category} • {course.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Submitted: {course.submitted}</span>
                      {course.students > 0 && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{(course.students / 1000).toFixed(1)}k students</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge text-xs capitalize" style={{
                      background: course.status === 'approved' ? 'rgba(16,185,129,0.1)' : course.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: course.status === 'approved' ? 'var(--success)' : course.status === 'pending' ? 'var(--accent)' : 'var(--error)'
                    }}>{course.status}</span>
                    {course.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(course.id, 'approved')} className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'none' }}>
                          <HiOutlineCheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => updateStatus(course.id, 'rejected')} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)', border: 'none' }}>
                          <HiOutlineX className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    <button className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--text-tertiary)', width: '2rem', height: '2rem' }}>
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
