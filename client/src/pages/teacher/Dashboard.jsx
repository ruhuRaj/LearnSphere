import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlinePlay, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlinePlus, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineLightningBolt, HiArrowRight } from 'react-icons/hi';

const engagementData = [
  { day: 'Mon', students: 120 }, { day: 'Tue', students: 185 }, { day: 'Wed', students: 140 },
  { day: 'Thu', students: 210 }, { day: 'Fri', students: 190 }, { day: 'Sat', students: 280 }, { day: 'Sun', students: 245 },
];

const courseDistribution = [
  { name: 'JEE Physics', value: 45, color: '#6366f1' },
  { name: 'NEET Physics', value: 30, color: '#06b6d4' },
  { name: 'CBSE 12 Physics', value: 25, color: '#f59e0b' },
];

const recentDoubts = [
  { student: 'Rahul K.', question: 'How to solve rotational dynamics problems?', course: 'JEE Physics', time: '20 min ago', avatar: '👨‍🎓' },
  { student: 'Priya S.', question: 'Explain electromagnetic induction formula', course: 'JEE Physics', time: '1h ago', avatar: '👩‍🎓' },
  { student: 'Amit V.', question: 'Difference between AC and DC circuits?', course: 'CBSE 12', time: '2h ago', avatar: '🧑‍🎓' },
];

const myCourses = [
  { id: 1, title: 'Complete JEE Physics', students: 12400, rating: 4.9, lessons: 120, revenue: '₹12.4L', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', emoji: '⚛️' },
  { id: 2, title: 'NEET Physics Complete', students: 8200, rating: 4.8, lessons: 110, revenue: '₹8.2L', gradient: 'linear-gradient(135deg, #06b6d4, #10b981)', emoji: '🔬' },
  { id: 3, title: 'CBSE 12 Physics', students: 7500, rating: 4.7, lessons: 80, revenue: '₹5.2L', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', emoji: '📘' },
];

export default function TeacherDashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>
              Teacher <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your courses and track student performance</p>
          </div>
          <div className="flex gap-2">
            <Link to="/teacher/create-course" className="btn btn-primary btn-sm"><HiOutlinePlus className="w-4 h-4" /> Create Course</Link>
            <button className="btn btn-secondary btn-sm"><HiOutlineVideoCamera className="w-4 h-4" /> Go Live</button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: '28,100', icon: HiOutlineUsers, color: '#6366f1', change: '+12%' },
            { label: 'Active Courses', value: '3', icon: HiOutlineBookOpen, color: '#06b6d4', change: '' },
            { label: 'Total Lectures', value: '310', icon: HiOutlinePlay, color: '#10b981', change: '+5' },
            { label: 'Revenue', value: '₹25.8L', icon: HiOutlineChartBar, color: '#f59e0b', change: '+18%' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  {stat.change && <span className="badge badge-success text-[10px]">{stat.change}</span>}
                </div>
                <div className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Engagement Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Student Engagement</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="students" stroke="#6366f1" fill="url(#engGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* My Courses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>My Courses</h3>
                <Link to="/teacher/create-course" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--primary)' }}>Add New <HiArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-3">
                {myCourses.map((course) => (
                  <div key={course.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: course.gradient }}>{course.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                      <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        <span><HiOutlineUsers className="w-3 h-3 inline mr-1" />{(course.students / 1000).toFixed(1)}k</span>
                        <span>⭐ {course.rating}</span>
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: 'var(--success)' }}>{course.revenue}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Course Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Student Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={courseDistribution} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {courseDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {courseDistribution.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: HiOutlinePlay, label: 'Upload Video', color: '#6366f1' },
                  { icon: HiOutlineDocumentText, label: 'Upload Notes', color: '#06b6d4' },
                  { icon: HiOutlineLightningBolt, label: 'Create Test', color: '#f59e0b' },
                  { icon: HiOutlineVideoCamera, label: 'Start Live', color: '#ef4444' },
                ].map((a) => (
                  <button key={a.label} className="p-3 rounded-xl text-center transition-all hover:scale-105" style={{ background: `${a.color}10` }}>
                    <a.icon className="w-5 h-5 mx-auto mb-1" style={{ color: a.color }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent Doubts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineChatAlt2 className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Recent Doubts
              </h3>
              <div className="space-y-3">
                {recentDoubts.map((d, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-lg cursor-pointer transition-colors" style={{ background: 'transparent' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--bg-tertiary)' }}>{d.avatar}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{d.question}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{d.student} • {d.time}</p>
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
