import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCalendar, FiUsers, FiVideo, FiMessageSquare, FiActivity, FiMic, FiMonitor, FiThumbsUp } from 'react-icons/fi';
import api from '../../services/api';

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/live-classes');
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load live classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async (cls) => {
    setActiveClass(cls);
    setMessages([
      { id: 1, user: 'System', text: `Welcome to "${cls.title}"! The class will begin shortly.`, time: new Date().toISOString() },
    ]);

    try {
      await api.post(`/live-classes/${cls._id}/attendance`, { courseId: cls.course?._id || cls.course, duration: cls.duration });
    } catch (error) {
      console.error('Failed to register attendance:', error);
    }
  };

  const getJitsiUrl = (cls) => {
    const room = cls?.roomId || `learn-sphere-live-${cls?._id || Date.now()}`;
    return `https://meet.jit.si/${encodeURIComponent(room)}`;
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), user: 'You', text: chatInput, time: new Date().toISOString() }]);
    setChatInput('');
  };

  const filtered = classes.filter(c => tab === 'upcoming' ? c.status !== 'ended' : c.status === 'ended');

  const setReminder = async (cls) => {
    try {
      await api.post(`/live-classes/${cls._id}/reminder`);
      setReminders((prev) => ({ ...prev, [cls._id]: true }));
      toast.success('Reminder saved. You can view it in Notifications.');
    } catch (error) {
      console.error('Failed to set reminder:', error);
      toast.error(error.response?.data?.message || 'Could not save reminder.');
    }
  };

  const handleWatchRecording = (cls) => {
    if (!cls.recordingUrl) {
      toast('Video not uploaded yet will be uploaded soon');
      return;
    }
    window.open(cls.recordingUrl, '_blank');
  };

  const handleJoinClick = (cls) => {
    if (cls.status === 'live' || cls.status === 'scheduled') {
      joinClass(cls);
    }
  };

  if (activeClass) {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Live Class Room */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginTop: '80px' }}>
          {/* Video Area */}
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ aspectRatio: '16/9', borderRadius: '16px', position: 'relative', overflow: 'hidden', background: '#000' }}>
              {activeClass?.roomId ? (
                <iframe
                  title={`Jitsi session for ${activeClass.title}`}
                  src={getJitsiUrl(activeClass)}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  style={{ border: 0, width: '100%', height: '100%' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
                  <div>
                    <FiMonitor size={48} style={{ color: '#6366f1', marginBottom: '16px' }} />
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{activeClass.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Your instructor will join shortly.</p>
                  </div>
                </div>
              )}
            </motion.div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, margin: 0 }}>{activeClass.title}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: '13px' }}>Room ID: <strong>{activeClass.roomId || 'Pending...'}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href={getJitsiUrl(activeClass)} target="_blank" rel="noreferrer" style={{ padding: '12px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Open in new tab</a>
                <button onClick={() => setActiveClass(null)} style={{ padding: '12px 18px', borderRadius: '12px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Leave Class</button>
              </div>
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              {[
                { icon: <FiMic size={18} />, label: 'Mute' },
                { icon: <FiVideo size={18} />, label: 'Video' },
                { icon: <FiThumbsUp size={18} />, label: 'Raise Hand', color: '#f59e0b' },
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
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: cls.status === 'live' ? '#ef444420' : cls.status === 'scheduled' ? '#6366f120' : '#10b98120', color: cls.status === 'live' ? '#ef4444' : cls.status === 'scheduled' ? '#6366f1' : '#3B82F6' }}>
                  {cls.status === 'live' ? '● LIVE' : cls.status === 'scheduled' ? '📅 Upcoming' : 'Ended'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{cls.duration}min</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{cls.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{cls.course?.title}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                <FiCalendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {new Date(cls.scheduledAt).toLocaleString()}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  <FiUsers size={14} /> {cls.attendeeCount} attendees
                </div>
                {cls.status === 'ended' ? (
                  <button onClick={() => handleWatchRecording(cls)} className="btn btn-primary btn-sm" style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    ▶ Watch Recording
                  </button>
                ) : (
                  <button onClick={() => cls.status === 'live' ? handleJoinClick(cls) : setReminder(cls)} style={{ padding: '8px 16px', borderRadius: '8px', background: cls.status === 'live' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    {cls.status === 'live' ? 'Join Now' : reminders[cls._id] ? 'Reminder Set' : 'Set Reminder'}
                  </button>
                )}
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
