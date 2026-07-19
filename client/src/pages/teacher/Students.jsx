import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineChartBar, HiOutlineMail } from 'react-icons/hi2';

const studentsData = [
  { id: 1, name: 'Rahul Kumar', email: 'rahul@test.com', course: 'JEE Physics', progress: 78, score: 85, streak: 12, avatar: '👨‍🎓', status: 'active' },
  { id: 2, name: 'Priya Sharma', email: 'priya@test.com', course: 'JEE Physics', progress: 92, score: 94, streak: 28, avatar: '👩‍🎓', status: 'active' },
  { id: 3, name: 'Amit Verma', email: 'amit@test.com', course: 'NEET Physics', progress: 45, score: 62, streak: 3, avatar: '🧑‍🎓', status: 'active' },
  { id: 4, name: 'Sneha Gupta', email: 'sneha@test.com', course: 'CBSE 12 Physics', progress: 88, score: 91, streak: 15, avatar: '👩‍🎓', status: 'active' },
  { id: 5, name: 'Vikash Yadav', email: 'vikash@test.com', course: 'JEE Physics', progress: 30, score: 48, streak: 0, avatar: '👨‍🎓', status: 'inactive' },
  { id: 6, name: 'Ananya Singh', email: 'ananya@test.com', course: 'NEET Physics', progress: 65, score: 73, streak: 7, avatar: '👩‍💻', status: 'active' },
];

export default function Students() {
  const [search, setSearch] = useState('');
  const filtered = studentsData.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>Student Analytics</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Track and manage your students' performance</p>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input className="input pl-10" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="stat-card text-center">
              <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--primary)' }}>6</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total Students</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--success)' }}>75%</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Avg. Score</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--accent)' }}>66%</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Avg. Progress</div>
            </div>
          </div>

          {/* Students Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Student', 'Course', 'Progress', 'Avg Score', 'Streak', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'var(--bg-tertiary)' }}>{s.avatar}</div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.course}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: s.progress > 70 ? 'var(--success)' : s.progress > 40 ? 'var(--accent)' : 'var(--error)' }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: s.score >= 80 ? 'var(--success)' : s.score >= 60 ? 'var(--accent)' : 'var(--error)' }}>{s.score}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.streak > 0 ? `🔥 ${s.streak} days` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge text-[10px]" style={{
                          background: s.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: s.status === 'active' ? 'var(--success)' : 'var(--error)'
                        }}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--text-tertiary)', width: '2rem', height: '2rem' }} title="View analytics">
                            <HiOutlineChartBar className="w-4 h-4" />
                          </button>
                          <button className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--text-tertiary)', width: '2rem', height: '2rem' }} title="Send message">
                            <HiOutlineMail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
