import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiUpload, FiFileText, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submission, setSubmission] = useState('');
  const [tab, setTab] = useState('pending');

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data.assignments || []);
    } catch {
      setAssignments([
        { _id: '1', title: 'Kinematics Problem Set', course: { title: 'JEE Physics' }, chapter: 'Chapter 3', deadline: new Date(Date.now() + 172800000).toISOString(), totalMarks: 50, description: 'Solve 10 problems on projectile motion and relative velocity.', submissions: [] },
        { _id: '2', title: 'Organic Chemistry Reactions', course: { title: 'NEET Chemistry' }, chapter: 'Chapter 7', deadline: new Date(Date.now() + 86400000).toISOString(), totalMarks: 40, description: 'Write mechanisms for 8 named reactions.', submissions: [] },
        { _id: '3', title: 'Integration Practice', course: { title: 'JEE Mathematics' }, chapter: 'Chapter 12', deadline: new Date(Date.now() - 86400000).toISOString(), totalMarks: 60, description: 'Solve 15 integration problems using substitution.', submissions: [{ student: 'me', score: 48, feedback: 'Good work! Minor errors in Q4 and Q12.' }] },
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!submission.trim() || !selectedAssignment) return;
    try {
      await api.post(`/assignments/${selectedAssignment._id}/submit`, { content: submission });
      alert('Assignment submitted successfully! 🎉');
      setSelectedAssignment(null);
      setSubmission('');
      fetchAssignments();
    } catch { alert('Submission failed. Please try again.'); }
  };

  const isDeadlinePassed = (d) => new Date(d) < new Date();
  const isSubmitted = (a) => a.submissions?.length > 0;

  const filtered = assignments.filter(a =>
    tab === 'pending' ? !isSubmitted(a) && !isDeadlinePassed(a.deadline)
    : tab === 'submitted' ? isSubmitted(a)
    : isDeadlinePassed(a.deadline) && !isSubmitted(a)
  );

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Assignments</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Complete assignments to earn XP and improve your understanding</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[{ key: 'pending', label: '📋 Pending' }, { key: 'submitted', label: '✅ Submitted' }, { key: 'missed', label: '⚠️ Missed' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: tab === t.key ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-secondary)', color: tab === t.key ? '#fff' : 'var(--text-secondary)' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{a.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{a.course?.title} • {a.chapter}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{a.description}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <span><FiClock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Due: {new Date(a.deadline).toLocaleDateString()}</span>
                    <span><FiFileText size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{a.totalMarks} marks</span>
                  </div>
                  {isSubmitted(a) && a.submissions[0]?.score !== undefined && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: '#10b98115', fontSize: '13px' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Score: {a.submissions[0].score}/{a.totalMarks}</span>
                      {a.submissions[0].feedback && <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '12px' }}>"{a.submissions[0].feedback}"</p>}
                    </div>
                  )}
                </div>
                <div>
                  {isSubmitted(a) ? (
                    <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#10b98120', color: '#10b981', fontSize: '12px', fontWeight: 600 }}><FiCheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Submitted</span>
                  ) : isDeadlinePassed(a.deadline) ? (
                    <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#ef444420', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}><FiAlertCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Missed</span>
                  ) : (
                    <button onClick={() => setSelectedAssignment(a)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      <FiUpload size={12} style={{ marginRight: '4px' }} /> Submit
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No {tab} assignments</p>
            </div>
          )}
        </div>

        {/* Submission Modal */}
        {selectedAssignment && (
          <div onClick={() => setSelectedAssignment(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Submit: {selectedAssignment.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Due: {new Date(selectedAssignment.deadline).toLocaleString()}</p>
              <textarea value={submission} onChange={e => setSubmission(e.target.value)} placeholder="Write your answer here..." rows={8} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setSelectedAssignment(null)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleSubmit} disabled={!submission.trim()} style={{ padding: '10px 20px', borderRadius: '8px', background: submission.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-tertiary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Assignment</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
