import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiUser, FiMail, FiBookOpen, FiClock, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

export default function TeacherApproval() {
  const [teachers, setTeachers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/admin/users?role=teacher');
      setTeachers(data.users || []);
    } catch {
      // Demo data
      setTeachers([
        { _id: '1', name: 'Dr. Sanjay Mishra', email: 'sanjay@mail.com', specialization: ['Physics', 'JEE'], bio: 'IIT Kharagpur alumnus with 10 years of teaching experience in JEE Physics.', qualifications: 'Ph.D. Physics, IIT Kharagpur', isApproved: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '2', name: 'Prof. Neha Agarwal', email: 'neha@mail.com', specialization: ['Chemistry', 'NEET'], bio: 'AIIMS graduate, specializes in Organic Chemistry for NEET preparation.', qualifications: 'M.Sc. Chemistry, AIIMS', isApproved: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
        { _id: '3', name: 'Dr. Rajesh Sharma', email: 'rajesh@mail.com', specialization: ['Physics'], bio: 'IIT Delhi alumnus, 15+ years teaching JEE Physics', qualifications: 'Ph.D. Physics, IIT Delhi', isApproved: true, createdAt: new Date(Date.now() - 604800000).toISOString() },
        { _id: '4', name: 'Prof. Meera Gupta', email: 'meera@mail.com', specialization: ['Biology', 'Chemistry'], bio: 'AIIMS topper, expert in NEET Biology & Chemistry', qualifications: 'M.D., AIIMS Delhi', isApproved: true, createdAt: new Date(Date.now() - 1209600000).toISOString() },
        { _id: '5', name: 'Rakesh Yadav', email: 'rakesh@mail.com', specialization: ['Mathematics'], bio: 'Self-taught math enthusiast.', qualifications: 'B.Sc. Mathematics', isApproved: false, rejected: true, rejectReason: 'Insufficient qualifications', createdAt: new Date(Date.now() - 259200000).toISOString() },
      ]);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, { isApproved: true });
      setTeachers(prev => prev.map(t => t._id === id ? { ...t, isApproved: true, rejected: false } : t));
    } catch {
      setTeachers(prev => prev.map(t => t._id === id ? { ...t, isApproved: true, rejected: false } : t));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await api.put(`/admin/users/${id}`, { isApproved: false, rejected: true, rejectReason: reason });
      setTeachers(prev => prev.map(t => t._id === id ? { ...t, rejected: true, rejectReason: reason } : t));
    } catch {
      setTeachers(prev => prev.map(t => t._id === id ? { ...t, rejected: true, rejectReason: reason } : t));
    }
  };

  const filtered = teachers.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pending') return !t.isApproved && !t.rejected && matchSearch;
    if (filter === 'approved') return t.isApproved && matchSearch;
    if (filter === 'rejected') return t.rejected && matchSearch;
    return matchSearch;
  });

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Teacher Approvals</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Review and approve teacher registration requests</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Pending', count: teachers.filter(t => !t.isApproved && !t.rejected).length, color: '#f59e0b', icon: '⏳' },
            { label: 'Approved', count: teachers.filter(t => t.isApproved).length, color: '#10b981', icon: '✅' },
            { label: 'Rejected', count: teachers.filter(t => t.rejected).length, color: '#ef4444', icon: '❌' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <FiSearch size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
          </div>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', textTransform: 'capitalize', background: filter === f ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Teacher Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 800, flexShrink: 0 }}>
                  {t.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}><FiMail size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t.email}</p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, background: t.isApproved ? '#10b98120' : t.rejected ? '#ef444420' : '#f59e0b20', color: t.isApproved ? '#10b981' : t.rejected ? '#ef4444' : '#f59e0b' }}>
                      {t.isApproved ? '✅ Approved' : t.rejected ? '❌ Rejected' : '⏳ Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>{t.bio}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {t.specialization?.map(s => (
                      <span key={s} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: '#6366f120', color: '#6366f1' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    <span><FiBookOpen size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t.qualifications}</span>
                    <span><FiClock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Applied: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  {t.rejected && t.rejectReason && (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#ef444410', fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
                      <strong>Rejection Reason:</strong> {t.rejectReason}
                    </div>
                  )}
                  {!t.isApproved && !t.rejected && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleApprove(t._id)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCheck size={14} /> Approve
                      </button>
                      <button onClick={() => handleReject(t._id)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiX size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
              <p>No {filter === 'all' ? '' : filter} teacher applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
