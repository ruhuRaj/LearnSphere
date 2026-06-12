import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineUserGroup, HiArrowRight, HiOutlineCog } from 'react-icons/hi';

const userGrowth = [
  { month: 'Jan', users: 5200 }, { month: 'Feb', users: 8100 }, { month: 'Mar', users: 12400 },
  { month: 'Apr', users: 18900 }, { month: 'May', users: 28500 }, { month: 'Jun', users: 42000 },
];
const revenue = [
  { month: 'Jan', amount: 2.1 }, { month: 'Feb', amount: 3.8 }, { month: 'Mar', amount: 5.2 },
  { month: 'Apr', amount: 8.4 }, { month: 'May', amount: 12.6 }, { month: 'Jun', amount: 18.2 },
];
const roleDistribution = [
  { name: 'Students', value: 85, color: '#6366f1' },
  { name: 'Teachers', value: 12, color: '#06b6d4' },
  { name: 'Admins', value: 3, color: '#f59e0b' },
];
const courseCategories = [
  { name: 'JEE', count: 120, color: '#6366f1' },
  { name: 'NEET', count: 95, color: '#06b6d4' },
  { name: 'CBSE 11', count: 80, color: '#10b981' },
  { name: 'CBSE 12', count: 85, color: '#f59e0b' },
  { name: 'State', count: 55, color: '#ec4899' },
];
const recentUsers = [
  { name: 'Vikash Singh', role: 'student', email: 'vikash@email.com', time: '5 min ago' },
  { name: 'Dr. Meera Patel', role: 'teacher', email: 'meera@email.com', time: '1h ago' },
  { name: 'Suraj Kumar', role: 'student', email: 'suraj@email.com', time: '2h ago' },
  { name: 'Anjali Devi', role: 'student', email: 'anjali@email.com', time: '3h ago' },
];
const pendingApprovals = [
  { name: 'Ravi Shankar', type: 'Teacher Registration', time: '2h ago' },
  { name: 'Advanced Organic Chemistry', type: 'Course Approval', time: '5h ago' },
  { name: 'Prof. Nandini Roy', type: 'Teacher Registration', time: '1 day ago' },
];

export default function AdminDashboard() {
  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
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
            <button className="btn btn-ghost btn-sm"><HiOutlineCog className="w-4 h-4" /></button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '42,000', icon: HiOutlineUsers, color: '#6366f1', change: '+18%' },
            { label: 'Active Courses', value: '435', icon: HiOutlineBookOpen, color: '#06b6d4', change: '+12' },
            { label: 'Revenue (MTD)', value: '₹18.2L', icon: HiOutlineCurrencyRupee, color: '#10b981', change: '+32%' },
            { label: 'Engagement', value: '89%', icon: HiOutlineTrendingUp, color: '#f59e0b', change: '+5%' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <span className="badge badge-success text-[10px]">{stat.change}</span>
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

            {/* Revenue */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Revenue (₹ Lakhs)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Course Categories */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Courses by Category</h3>
              <div className="space-y-3">
                {courseCategories.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-sm w-20 font-medium" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                    <div className="flex-1 h-2.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / 120) * 100}%`, background: c.color }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>{c.count}</span>
                  </div>
                ))}
              </div>
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
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending Approvals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Pending Approvals
                <span className="badge badge-warning text-[10px] ml-auto">{pendingApprovals.length}</span>
              </h3>
              <div className="space-y-3">
                {pendingApprovals.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{a.type} • {a.time}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="btn btn-sm flex-1" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: 'none', padding: '0.25rem' }}>Approve</button>
                      <button className="btn btn-sm flex-1" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)', border: 'none', padding: '0.25rem' }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Users */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Recent Users</h3>
                <Link to="/admin/users" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>View All</Link>
              </div>
              <div className="space-y-3">
                {recentUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: u.role === 'teacher' ? 'var(--secondary)' : 'var(--primary)' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{u.role} • {u.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
