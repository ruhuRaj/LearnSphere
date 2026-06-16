import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCheckCircle, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #10b981)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #059669)',
];

export default function CourseApproval() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await api.get('/admin/courses', { params });
      setCourses(data.courses || []);
      setCounts({
        total: data.total || 0,
        pending: (data.courses || []).filter((c) => !c.isApproved).length,
        approved: (data.courses || []).filter((c) => c.isApproved).length,
      });
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/courses/${id}/status`, { status });
      toast.success(`Course ${status}!`);
      fetchCourses(); // refresh
    } catch (err) {
      toast.error('Failed to update course');
    }
  };

  const filtered = courses.filter((c) => {
    if (!search) return true;
    return c.title?.toLowerCase().includes(search.toLowerCase()) ||
           c.teacher?.name?.toLowerCase().includes(search.toLowerCase());
  });

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
              <input
                className="input pl-10"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all" style={{
                  background: statusFilter === s ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: statusFilter === s ? 'white' : 'var(--text-secondary)'
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total', value: counts.total, color: '#6366f1' },
              { label: 'Pending', value: counts.pending, color: '#f59e0b' },
              { label: 'Approved', value: counts.approved, color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center py-3">
                <div className="text-xl font-bold font-[Outfit]" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading courses...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No courses found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {statusFilter === 'pending' ? 'No courses awaiting approval' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            /* Course Cards */
            <div className="space-y-4">
              {filtered.map((course, i) => (
                <motion.div key={course._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        by {course.teacher?.name || 'Unknown'} • {course.category} • ₹{course.price}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                        {course.totalStudents > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{course.totalStudents} students</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge text-xs capitalize" style={{
                        background: course.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: course.isApproved ? 'var(--success)' : 'var(--accent)'
                      }}>
                        {course.isApproved ? 'approved' : 'pending'}
                      </span>
                      {!course.isApproved && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(course._id, 'approved')} className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'none' }}>
                            <HiOutlineCheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button onClick={() => updateStatus(course._id, 'rejected')} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)', border: 'none' }}>
                            <HiOutlineX className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
