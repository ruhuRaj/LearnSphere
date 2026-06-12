import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HiOutlineBookOpen, HiOutlineClock, HiOutlineChartBar, HiOutlineFire, HiOutlinePlay, HiOutlineAcademicCap, HiOutlineLightningBolt, HiOutlineSparkles, HiArrowRight, HiOutlineBell, HiOutlineCalendar } from 'react-icons/hi';

const performanceData = [
  { day: 'Mon', score: 72 }, { day: 'Tue', score: 85 }, { day: 'Wed', score: 68 },
  { day: 'Thu', score: 90 }, { day: 'Fri', score: 78 }, { day: 'Sat', score: 92 }, { day: 'Sun', score: 88 },
];

const weeklyHours = [
  { day: 'Mon', hours: 3.5 }, { day: 'Tue', hours: 2.8 }, { day: 'Wed', hours: 4.2 },
  { day: 'Thu', hours: 3.0 }, { day: 'Fri', hours: 5.1 }, { day: 'Sat', hours: 6.2 }, { day: 'Sun', hours: 4.5 },
];

const enrolledCourses = [
  { id: 1, title: 'Complete JEE Physics', progress: 65, lessons: 120, completed: 78, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', emoji: '⚛️', nextLesson: 'Rotational Dynamics' },
  { id: 2, title: 'JEE Mathematics Pro', progress: 42, lessons: 150, completed: 63, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', emoji: '📐', nextLesson: 'Definite Integrals' },
  { id: 3, title: 'JEE Chemistry Complete', progress: 28, lessons: 130, completed: 36, gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)', emoji: '⚗️', nextLesson: 'Organic Reactions' },
];

const upcomingClasses = [
  { title: 'Live: Electromagnetic Induction', teacher: 'Dr. Anita Verma', time: 'Today, 4:00 PM', live: true },
  { title: 'Live: Organic Chemistry Reactions', teacher: 'Dr. Kavita Nair', time: 'Tomorrow, 10:00 AM', live: false },
];

const recommendations = [
  { title: 'Practice Rotational Mechanics', type: 'Test', icon: '📝' },
  { title: 'Watch: Faraday\'s Law', type: 'Video', icon: '🎥' },
  { title: 'Revise Thermodynamics Notes', type: 'Notes', icon: '📒' },
];

const achievements = [
  { name: '7-Day Streak', icon: '🔥', earned: true },
  { name: 'Quiz Master', icon: '🏆', earned: true },
  { name: 'Fast Learner', icon: '⚡', earned: false },
  { name: 'Top Scorer', icon: '🥇', earned: false },
];

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || 'Student';

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>
                Welcome back, <span className="gradient-text">{userName.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's your learning progress for today.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/student/ai-chat" className="btn btn-primary btn-sm"><HiOutlineSparkles className="w-4 h-4" /> AI Assistant</Link>
              <button className="btn btn-secondary btn-sm relative"><HiOutlineBell className="w-4 h-4" /><span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: 'var(--error)' }}>3</span></button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Enrolled Courses', value: '3', icon: HiOutlineBookOpen, color: '#6366f1' },
            { label: 'Study Hours', value: '29.3h', icon: HiOutlineClock, color: '#06b6d4' },
            { label: 'Avg. Score', value: '82%', icon: HiOutlineChartBar, color: '#10b981' },
            { label: 'Day Streak', value: '7 🔥', icon: HiOutlineFire, color: '#f59e0b' },
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
          {/* Left Column - Charts & Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Performance Overview</h3>
                <span className="badge badge-success">+12% this week</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#perfGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Continue Learning */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Continue Learning</h3>
                <Link to="/student/courses" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--primary)' }}>View All <HiArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <Link key={course.id} to={`/student/learn/${course.id}`} className="glass-card p-4 flex items-center gap-4 group block">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: course.gradient }}>
                      {course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Next: {course.nextLesson}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                          <div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: course.gradient }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{course.progress}%</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--bg-tertiary)' }}>
                      <HiOutlinePlay className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Study Hours */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Study Hours This Week</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', fontSize: '0.8rem' }} />
                  <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineCalendar className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Upcoming Classes
              </h3>
              <div className="space-y-3">
                {upcomingClasses.map((cls, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      {cls.live && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--error)' }} />}
                      <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cls.title}</h4>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{cls.teacher} • {cls.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineSparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} /> AI Recommendations
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="text-lg">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{rec.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
              <h3 className="font-semibold font-[Outfit] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <HiOutlineAcademicCap className="w-5 h-5" style={{ color: 'var(--primary)' }} /> Achievements
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((ach) => (
                  <div key={ach.name} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-tertiary)', opacity: ach.earned ? 1 : 0.4 }}>
                    <div className="text-2xl mb-1">{ach.icon}</div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{ach.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* XP Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Level Progress</h3>
                <span className="badge badge-primary">Level 12</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineLightningBolt className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>2,450 XP</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ 3,000 XP</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full animate-gradient" style={{ width: '82%', background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)', backgroundSize: '200% 200%' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>550 XP to next level</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
