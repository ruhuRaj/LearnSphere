import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiThumbsUp, FiSearch, FiPlus, FiBookmark, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [replyText, setReplyText] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getVoteCount = (item) => {
    if (typeof item?.upvotesCount === 'number') return item.upvotesCount;
    if (Array.isArray(item?.upvotes)) return item.upvotes.length;
    return Number(item?.upvotes) || 0;
  };

  const openThread = async (thread) => {
    try {
      const { data } = await api.get(`/forum/${thread._id}`);
      setSelectedThread(data.thread);
    } catch (error) {
      console.error('Failed to load thread details', error);
      setSelectedThread(thread);
      toast.error('Could not refresh this thread');
    }
  };

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/forum', { params: { category: filter === 'all' ? '' : filter, search } });
        setThreads(data.threads || []);
      } catch (error) {
        console.error('Failed to load forum threads', error);
        toast.error('Could not load forum threads');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadThreads, 150);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const catColors = { doubt: '#ef4444', discussion: '#3b82f6', resource: '#10b981', announcement: '#f59e0b', general: '#94a3b8' };
  const filtered = threads.filter(t => (filter === 'all' || t.category === filter) && (!search || t.title.toLowerCase().includes(search.toLowerCase())));

  if (selectedThread) {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginTop: '80px' }}>
          <button onClick={() => setSelectedThread(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>← Back to Forum</button>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, background: `${catColors[selectedThread.category]}20`, color: catColors[selectedThread.category], textTransform: 'capitalize' }}>{selectedThread.category}</span>
              {selectedThread.tags?.map(t => <span key={t} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '11px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{t}</span>)}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>{selectedThread.title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{selectedThread.content}</p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <span>by <strong style={{ color: 'var(--text-primary)' }}>{selectedThread.author?.name}</strong></span>
              <span><FiThumbsUp size={12} style={{ verticalAlign: 'middle' }} /> {getVoteCount(selectedThread)}</span>
              <span><FiEye size={12} style={{ verticalAlign: 'middle' }} /> {selectedThread.views}</span>
              <span>{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>{selectedThread.replies?.length || 0} Replies</h3>
          {selectedThread.replies?.map((r, i) => (
            <div key={i} className="glass-card" style={{ padding: '16px', borderRadius: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{r.author?.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.content}</p>
              <button style={{ marginTop: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiThumbsUp size={12} /> {getVoteCount(r)}</button>
            </div>
          ))}
          <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            <button onClick={async () => {
              if (!replyText.trim()) return;
              try {
                setSubmitting(true);
                const { data } = await api.post(`/forum/${selectedThread._id}/replies`, { content: replyText });
                setSelectedThread(data.thread);
                setReplyText('');
                toast.success('Reply posted');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to post reply');
              } finally {
                setSubmitting(false);
              }
            }} style={{ marginTop: '8px', padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }} disabled={submitting}>{submitting ? 'Posting...' : 'Post Reply'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Community Forum</motion.h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Discuss, share, and learn together</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus size={14} /> New Thread</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threads..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
          </div>
          {['all', 'doubt', 'discussion', 'resource', 'announcement'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px', textTransform: 'capitalize', background: filter === f ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => openThread(t)} className="glass-card" style={{ padding: '18px', borderRadius: '14px', cursor: 'pointer', borderLeft: t.isPinned ? '3px solid #f59e0b' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                    {t.isPinned && <FiBookmark size={12} style={{ color: '#f59e0b' }} />}
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: `${catColors[t.category]}20`, color: catColors[t.category], textTransform: 'capitalize' }}>{t.category}</span>
                    {t.tags?.map(tag => <span key={tag} style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{tag}</span>)}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{t.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>by {t.author?.name} • {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)', alignItems: 'center', flexShrink: 0 }}>
                  <span><FiThumbsUp size={12} /> {getVoteCount(t)}</span>
                  <span><FiMessageSquare size={12} /> {t.replies?.length || 0}</span>
                  <span><FiEye size={12} /> {t.views}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {showCreate && (
          <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '540px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Create New Thread</h3>
              <input value={newThread.title} onChange={e => setNewThread(p => ({ ...p, title: e.target.value }))} placeholder="Thread title..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', marginBottom: '12px' }} />
              <textarea value={newThread.content} onChange={e => setNewThread(p => ({ ...p, content: e.target.value }))} placeholder="What's on your mind?" rows={5} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select value={newThread.category} onChange={e => setNewThread(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  {['general', 'doubt', 'discussion', 'resource'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input value={newThread.tags} onChange={e => setNewThread(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button onClick={async () => {
                if (!newThread.title.trim() || !newThread.content.trim()) {
                  toast.error('Please add a title and description');
                  return;
                }
                try {
                  setSubmitting(true);
                  const { data } = await api.post('/forum', {
                    title: newThread.title,
                    content: newThread.content,
                    category: newThread.category,
                    tags: newThread.tags,
                  });
                  setThreads(prev => [data.thread, ...prev]);
                  setShowCreate(false);
                  setNewThread({ title: '', content: '', category: 'general', tags: '' });
                  toast.success('Thread created');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Could not create thread');
                } finally {
                  setSubmitting(false);
                }
              }} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }} disabled={submitting}>{submitting ? 'Creating...' : 'Create Thread'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
