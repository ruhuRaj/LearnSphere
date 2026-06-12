import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiUsers, FiClock, FiCheckCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', chapter: '', deadline: '', totalMarks: 100 });
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data.assignments || []);
    } catch {
      setAssignments([
        { _id: '1', title: 'Kinematics Problem Set', course: { title: 'JEE Physics' }, chapter: 'Chapter 3', deadline: new Date(Date.now() + 172800000).toISOString(), totalMarks: 50, submissions: [
          { student: { name: 'Aarav S.', avatar: '' }, content: 'Answer text...', score: 45, feedback: 'Great work!', submittedAt: new Date().toISOString() },
          { student: { name: 'Priya P.', avatar: '' }, content: 'Answer...', submittedAt: new Date().toISOString() },
        ]},
        { _id: '2', title: 'Organic Reactions', course: { title: 'NEET Chemistry' }, chapter: 'Chapter 7', deadline: new Date(Date.now() + 86400000).toISOString(), totalMarks: 40, submissions: [] },
      ]);
    }
  };

  const createAssignment = async () => {
    try {
      await api.post('/assignments', form);
      setShowCreate(false);
      setForm({ title: '', description: '', course: '', chapter: '', deadline: '', totalMarks: 100 });
      fetchAssignments();
    } catch { alert('Failed to create assignment'); }
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Assignments</motion.h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Create and manage assignments for your students</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiPlus size={16} /> Create Assignment
          </button>
        </div>

        {/* Assignment List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{a.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{a.course?.title} • {a.chapter}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <span><FiClock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Due: {new Date(a.deadline).toLocaleDateString()}</span>
                    <span><FiUsers size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{a.submissions?.length || 0} submissions</span>
                    <span>📊 {a.totalMarks} marks</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedAssignment(a)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    View Submissions ({a.submissions?.length || 0})
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Create Assignment</h3>
              {['title', 'description', 'chapter'].map(field => (
                <div key={field} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>{field}</label>
                  {field === 'description' ? (
                    <textarea value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
                  ) : (
                    <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Deadline</label>
                  <input type="datetime-local" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Marks</label>
                  <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button onClick={createAssignment} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Create</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Submissions Modal */}
        {selectedAssignment && (
          <div onClick={() => setSelectedAssignment(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px', maxHeight: '80vh', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Submissions — {selectedAssignment.title}</h3>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '60vh', padding: '16px' }}>
                {selectedAssignment.submissions?.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px' }}>No submissions yet</p>
                ) : (
                  selectedAssignment.submissions?.map((s, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>{s.student?.name?.charAt(0) || '?'}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{s.student?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Submitted {new Date(s.submittedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {s.score !== undefined ? (
                          <span style={{ padding: '4px 10px', borderRadius: '16px', background: '#10b98120', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>{s.score}/{selectedAssignment.totalMarks}</span>
                        ) : (
                          <span style={{ padding: '4px 10px', borderRadius: '16px', background: '#f59e0b20', color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>Pending</span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>{s.content}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
