import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap, HiOutlinePencil, HiOutlineCamera, HiOutlineShieldCheck, HiOutlineLightningBolt } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Student User',
    email: user?.email || 'student@demo.com',
    phone: user?.phone || '+91 98765 43210',
    bio: 'JEE 2026 aspirant | Physics lover | Coding enthusiast',
    target: 'JEE Advanced',
    language: 'English',
  });

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="glass-card p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                  {form.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--primary)', color: 'white' }}>
                  <HiOutlineCamera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>{form.name}</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{form.bio}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 justify-center sm:justify-start">
                  <span className="badge badge-primary">{user?.role || 'Student'}</span>
                  <span className="badge badge-success"><HiOutlineShieldCheck className="w-3 h-3" /> Verified</span>
                  <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent)' }}>
                    <HiOutlineLightningBolt className="w-3 h-3" /> 2,450 XP
                  </span>
                </div>
              </div>
              <button onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm">
                <HiOutlinePencil className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="glass-card p-6">
              <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    <input className="input pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!editing} />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    <input className="input pl-10" value={form.email} disabled />
                  </div>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    <input className="input pl-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!editing} />
                  </div>
                </div>
                {editing && <button onClick={handleSave} className="btn btn-primary w-full">Save Changes</button>}
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Academic Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Target Exam</label>
                    <div className="relative">
                      <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      <select className="input pl-10" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} disabled={!editing} style={{ appearance: 'auto' }}>
                        {['JEE Mains', 'JEE Advanced', 'NEET', 'CBSE 11', 'CBSE 12', 'Bihar Board', 'Jharkhand Board', 'Bengal Board'].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Preferred Language</label>
                    <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} disabled={!editing} style={{ appearance: 'auto' }}>
                      <option>English</option><option>Hindi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="glass-card p-6">
                <h3 className="font-semibold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Learning Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Courses', value: '3' },
                    { label: 'Tests Taken', value: '24' },
                    { label: 'Study Hours', value: '156h' },
                    { label: 'Streak', value: '7 days' },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="text-lg font-bold font-[Outfit]" style={{ color: 'var(--primary)' }}>{s.value}</div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
