import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiVideo, FiMessageSquare, FiActivity, FiMic, FiMonitor } from 'react-icons/fi';
import api from '../../services/api';

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/live-classes');
      setClasses(data.classes || []);
    } catch {
      // Demo data
      setClasses([
        { _id: '1', title: 'Electromagnetic Induction — Part 2', course: { title: 'JEE Physics' }, teacher: { name: 'Dr. Sharma', avatar: '' }, scheduledAt: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled', attendeeCount: 0, duration: 60 },
        { _id: '2', title: 'Organic Chemistry — Reactions', course: { title: 'NEET Chemistry' }, teacher: { name: 'Prof. Gupta', avatar: '' }, scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled', attendeeCount: 0, duration: 90 },
        { _id: '3', title: 'Calculus — Integration Techniques', course: { title: 'JEE Mathematics' }, teacher: { name: 'Dr. Verma', avatar: '' }, scheduledAt: new Date(Date.now() - 3600000).toISOString(), status: 'ended', attendeeCount: 234, duration: 60, recordingUrl: '#' },
      ]);
    }
  };

  const joinClass = (cls) => {
    setActiveClass(cls);
    setMessages([
      { id: 1, user: 'System', text: `Welcome to "${cls.title}"! The class will begin shortly.`, time: new Date().toISOString() },
    ]);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), user: 'You', text: chatInput, time: new Date().toISOString() }]);
    setChatInput('');
  };

  const filtered = classes.filter(c => tab === 'upcoming' ? c.status !== 'ended' : c.status === 'ended');

  if (activeClass) {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Live Class Room */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginTop: '80px' }}>
          {/* Video Area */}
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ aspectRatio: '16/9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center' }}>
                <FiMonitor size={48} style={{ color: '#6366f1', marginBottom: '16px' }} />
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{activeClass.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>by {activeClass.teacher?.name}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#ef444420', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>● LIVE</span>
                </div>
              </div>
            </motion.div>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              {[
                { icon: <FiMic size={18} />, label: 'Mute' },
                { icon: <FiVideo size={18} />, label: 'Video' },
                { icon: <FiHand size={18} />, label: 'Raise Hand', color: '#f59e0b' },
              ].map(btn => (
                <button key={btn.label} style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: btn.color || 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
              <button onClick={() => setActiveClass(null)} style={{ padding: '12px 20px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Leave Class</button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="glass-card" style={{ borderRadius: '16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', maxHeight: '600px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>💬 Live Chat</h4>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: msg.user === 'You' ? '#6366f1' : '#a855f7' }}>{msg.user}: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
              <button onClick={sendChat} style={{ padding: '10px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }} className="gradient-text">Live Classes</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Join interactive live sessions with your teachers</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['upcoming', 'recordings'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: tab === t ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-secondary)', color: tab === t ? '#fff' : 'var(--text-secondary)' }}>
              {t === 'upcoming' ? '📅 Upcoming' : '🎬 Recordings'}
            </button>
          ))}
        </div>

        {/* Class Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((cls, i) => (
            <motion.div key={cls._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: cls.status === 'live' ? '#ef444420' : cls.status === 'scheduled' ? '#6366f120' : '#10b98120', color: cls.status === 'live' ? '#ef4444' : cls.status === 'scheduled' ? '#6366f1' : '#10b981' }}>
                  {cls.status === 'live' ? '● LIVE' : cls.status === 'scheduled' ? '📅 Upcoming' : '✅ Ended'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{cls.duration}min</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{cls.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{cls.course?.title}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                <FiCalendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {new Date(cls.scheduledAt).toLocaleString()}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  <FiUsers size={14} /> {cls.attendeeCount} attendees
                </div>
                <button onClick={() => cls.status !== 'ended' ? joinClass(cls) : null} style={{ padding: '8px 16px', borderRadius: '8px', background: cls.status === 'ended' ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  {cls.status === 'ended' ? '▶ Watch Recording' : cls.status === 'live' ? 'Join Now' : 'Set Reminder'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📺</div>
            <p>No {tab === 'upcoming' ? 'upcoming classes' : 'recordings'} available</p>
          </div>
        )}
      </div>
    </div>
  );
}
