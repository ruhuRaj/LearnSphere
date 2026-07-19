import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineUserGroup, HiArrowRight, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import api from '../../services/api';
import { logout } from '../../features/authSlice';

const ROLE_COLORS = { Students: '#6366f1', Teachers: '#06b6d4', Admins: '#f59e0b' };
const CATEGORY_COLORS = { JEE: '#6366f1', NEET: '#06b6d4', CBSE11: '#10b981', CBSE12: '#f59e0b', Bihar: '#ec4899', Jharkhand: '#8b5cf6', Bengal: '#ef4444' };

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, usersRes, coursesRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users?limit=5'),
          api.get('/admin/courses?status=pending&limit=5'),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setRecentUsers(usersRes.data.users || []);
        setPendingCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center" style={{ background: 'var(--bg-primary)', minHeight: '60vh' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalUsers = analytics?.totalUsers || 0;
  const totalCourses = analytics?.totalCourses || 0;
  const publishedCourses = analytics?.publishedCourses || 0;
  const pendingTeachers = analytics?.pendingTeachers || 0;
  const pendingCoursesCount = analytics?.pendingCourses || 0;

  const roleDistribution = [
    { name: 'Students', value: analytics?.totalStudents || 0, color: ROLE_COLORS.Students },
    { name: 'Teachers', value: analytics?.totalTeachers || 0, color: ROLE_COLORS.Teachers },
    { name: 'Admins', value: Math.max(1, totalUsers - (analytics?.totalStudents || 0) - (analytics?.totalTeachers || 0)), color: ROLE_COLORS.Admins },
  ];

  const userGrowth = (analytics?.userGrowth || []).map((g) => ({
    month: g._id,
    users: g.count,
  }));

  const courseCategories = (analytics?.categoryDist || []).map((c) => ({
    name: c._id,
    count: c.count,
    color: CATEGORY_COLORS[c._id] || '#6366f1',
  }));
  const maxCat = Math.max(...courseCategories.map((c) => c.count), 1);

  return (
    <div className="page-container -mt-18" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Admin <span className="gradient-text">Dashboard</span></h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Platform overview and management</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/users" className="btn btn-secondary btn-sm"><HiOutlineUsers className="w-4 h-4" /> Users</Link>
            <Link to="/admin/courses" className="btn btn-secondary btn-sm"><HiOutlineBookOpen className="w-4 h-4" /> Courses</Link>
            <Link to="/admin/settings" className="btn btn-ghost btn-sm"><HiOutlineCog className="w-4 h-4" /></Link>
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/');
              }}
              className="btn btn-error btn-sm text-red-500"
            >
              <HiOutlineLogout className="w-4 h-4 bg-red" /> Logout
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totalUsers.toLocaleString(), icon: HiOutlineUsers, color: '#6366f1' },
            { label: 'Total Courses', value: totalCourses.toString(), icon: HiOutlineBookOpen, color: '#06b6d4' },
            { label: 'Published', value: publishedCourses.toString(), icon: HiOutlineTrendingUp, color: '#10b981' },
            { label: 'Pending Review', value: (pendingCoursesCount + pendingTeachers).toString(), icon: HiOutlineShieldCheck, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Growth */}
            {userGrowth.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>User Growth</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={userGrowth}>
                    <defs>
                      <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#ugGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Course Categories */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Courses by Category</h3>
              {courseCategories.length > 0 ? (
                <div className="space-y-3">
                  {courseCategories.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-sm w-20 font-medium" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                      <div className="flex-1 h-2.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / maxCat) * 100}%`, background: c.color }} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No courses yet</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>User Roles</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart><Pie data={roleDistribution} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">{roleDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {roleDistribution.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} /><span style={{ color: 'var(--text-secondary)' }}>{r.name}</span></div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending Courses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Pending Courses
                {pendingCourses.length > 0 && <span className="badge badge-warning text-[10px] ml-auto">{pendingCourses.length}</span>}
              </h3>
              {pendingCourses.length > 0 ? (
                <div className="space-y-3">
                  {pendingCourses.map((c) => (
                    <div key={c._id} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>by {c.teacher?.name || 'Unknown'} • {c.category}</p>
                    </div>
                  ))}
                  <Link to="/admin/courses" className="btn btn-ghost w-full text-xs" style={{ color: 'var(--primary)' }}>
                    View All Courses <HiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No pending courses 🎉</p>
              )}
            </motion.div>

            {/* Recent Users */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Recent Users</h3>
                <Link to="/admin/users" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>View All</Link>
              </div>
              <div className="space-y-3">
                {recentUsers.length > 0 ? recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: u.role === 'teacher' ? 'var(--secondary)' : u.role === 'admin' ? 'var(--accent)' : 'var(--primary)' }}>
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{u.role} • {u.email}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No users yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
