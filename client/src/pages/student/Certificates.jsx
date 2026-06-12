import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiDownload, FiShare2, FiExternalLink } from 'react-icons/fi';

export default function Certificates() {
  const [certificates] = useState([
    { _id: '1', course: { title: 'JEE Physics Complete Course' }, certificateId: 'LS-CERT-2026-001', completedAt: '2026-05-15', grade: 'A+', score: 92 },
    { _id: '2', course: { title: 'NEET Biology Mastery' }, certificateId: 'LS-CERT-2026-002', completedAt: '2026-04-20', grade: 'A', score: 85 },
  ]);
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>My Certificates</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Certificates earned from completed courses</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {certificates.map((cert, i) => (
            <motion.div key={cert._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {/* Certificate Preview */}
              <div style={{ padding: '32px 24px', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', textAlign: 'center', position: 'relative', borderBottom: '2px solid #6366f1' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏅</div>
                <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#6366f1', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Certificate of Completion</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{cert.course.title}</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>LearnSphere Academy</div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                  <span style={{ color: '#10b981' }}>Grade: {cert.grade}</span>
                  <span style={{ color: '#a855f7' }}>Score: {cert.score}%</span>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  <span>ID: {cert.certificateId}</span>
                  <span>Completed: {new Date(cert.completedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedCert(cert)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiAward size={14} /> View
                  </button>
                  <button style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                    <FiDownload size={14} />
                  </button>
                  <button style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                    <FiShare2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No certificates yet</h3>
            <p>Complete a course to earn your first certificate!</p>
          </div>
        )}

        {/* Full Certificate View Modal */}
        {selectedCert && (
          <div onClick={() => setSelectedCert(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '700px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #6366f1' }}>
              <div style={{ padding: '48px 40px', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#6366f1', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>LearnSphere Academy</div>
                <div style={{ width: '72px', height: '2px', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: '8px' }}>Certificate of Completion</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>This is to certify that</p>
                <h3 style={{ fontSize: '24px', fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px' }}>Student Demo</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>has successfully completed the course</p>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>{selectedCert.course.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '14px', marginBottom: '24px' }}>
                  <div><div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>GRADE</div><div style={{ color: '#10b981', fontWeight: 700, fontSize: '18px' }}>{selectedCert.grade}</div></div>
                  <div><div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>SCORE</div><div style={{ color: '#a855f7', fontWeight: 700, fontSize: '18px' }}>{selectedCert.score}%</div></div>
                  <div><div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>DATE</div><div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{new Date(selectedCert.completedAt).toLocaleDateString()}</div></div>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Certificate ID: {selectedCert.certificateId}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FiDownload size={14} /> Download PDF</button>
                <button style={{ padding: '10px 20px', borderRadius: '8px', background: '#0a66c2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><FiExternalLink size={14} /> Share on LinkedIn</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
