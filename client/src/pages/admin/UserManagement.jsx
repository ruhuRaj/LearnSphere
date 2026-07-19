import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineBan, HiOutlineCheckCircle, HiArrowLeft } from 'react-icons/hi2';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { limit: 20 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/users/${id}`, { status });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status } : u)));
      toast.success(`User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : status === 'hold' ? 'put on hold' : 'updated'}`);
    } catch (err) {
      toast.error('Could not update user status');
    }
  };

  const approveTeacher = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, { isApproved: true, status: 'active', rejected: false });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: 'active', isApproved: true, rejected: false } : u)));
      toast.success('Teacher approved successfully!');
    } catch (err) {
      toast.error('Could not approve teacher');
    }
  };

  return (
    <div className="page-container -mt-18" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
                <HiArrowLeft className="w-4 h-4" /> Back
              </button>
              <div>
                <h1 className="text-2xl font-bold font-[Outfit] mb-1" style={{ color: 'var(--text-primary)' }}>User Management</h1>
                <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>Manage all platform users</p>
              </div>
            </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              <input className="input pl-10" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {['all', 'student', 'teacher', 'admin'].map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)} className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all" style={{
                  background: roleFilter === r ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: roleFilter === r ? 'white' : 'var(--text-secondary)'
                }}>{r}</button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total', value: users.length, color: '#6366f1' },
              { label: 'Students', value: users.filter((u) => u.role === 'student').length, color: '#06b6d4' },
              { label: 'Teachers', value: users.filter((u) => u.role === 'teacher').length, color: '#10b981' },
              { label: 'Pending', value: users.filter((u) => u.status === 'pending').length, color: '#f59e0b' },
              { label: 'On Hold', value: users.filter((u) => u.status === 'hold').length, color: '#f97316' },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center py-3">
                <div className="text-xl font-bold font-[Outfit]" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['User', 'Role', 'Status', 'Joined', 'Courses', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{
                            background: u.role === 'admin' ? 'var(--accent)' : u.role === 'teacher' ? 'var(--secondary)' : 'var(--primary)'
                          }}>{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="badge text-xs capitalize" style={{
                        background: u.role === 'admin' ? 'rgba(245,158,11,0.1)' : u.role === 'teacher' ? 'rgba(6,182,212,0.1)' : 'rgba(99,102,241,0.1)',
                        color: u.role === 'admin' ? 'var(--accent)' : u.role === 'teacher' ? 'var(--secondary)' : 'var(--primary)'
                      }}>{u.role}</span></td>
                      <td className="px-4 py-3"><span className="badge text-xs capitalize" style={{
                        background: u.status === 'active' ? 'rgba(16,185,129,0.1)' : u.status === 'pending' ? 'rgba(245,158,11,0.1)' : u.status === 'hold' ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)',
                        color: u.status === 'active' ? 'var(--success)' : u.status === 'pending' ? 'var(--accent)' : u.status === 'hold' ? '#f97316' : 'var(--error)'
                      }}>{u.status}</span></td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {Array.isArray(u.enrolledCourses) ? new Set(u.enrolledCourses.map((course) => String(course))).size : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {u.status === 'pending' && (
                            <button onClick={() => approveTeacher(u._id)} className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--success)', width: '2rem', height: '2rem' }} title="Approve">
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.status === 'active' && (
                            <>
                              <button onClick={() => updateStatus(u._id, 'suspended')} className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--accent)', width: '2rem', height: '2rem' }} title="Suspend">
                                <HiOutlineBan className="w-4 h-4" />
                              </button>
                              <button onClick={() => updateStatus(u._id, 'hold')} className="btn-icon btn-ghost rounded-lg" style={{ color: '#f59e0b', width: '2rem', height: '2rem' }} title="Put on hold">
                                <HiOutlineBan className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {u.status === 'suspended' && (
                            <button onClick={() => updateStatus(u._id, 'active')} className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--success)', width: '2rem', height: '2rem' }} title="Activate">
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.status === 'hold' && (
                            <button onClick={() => updateStatus(u._id, 'active')} className="btn-icon btn-ghost rounded-lg" style={{ color: 'var(--success)', width: '2rem', height: '2rem' }} title="Activate">
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            </button>
                          )}
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
