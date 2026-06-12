import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import { getRank, RANK_TIERS } from '../../utils/constants';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [tab, setTab] = useState('global');

  useEffect(() => {
    // Demo data — in production, fetch from API
    setLeaders([
      { rank: 1, name: 'Aarav Sharma', avatar: '', xp: 12500, level: 28, streak: 45, badge: '🏆' },
      { rank: 2, name: 'Priya Patel', avatar: '', xp: 11200, level: 26, streak: 38, badge: '🥈' },
      { rank: 3, name: 'Rahul Kumar', avatar: '', xp: 10800, level: 25, streak: 32, badge: '🥉' },
      { rank: 4, name: 'Sneha Singh', avatar: '', xp: 9500, level: 23, streak: 28, badge: '' },
      { rank: 5, name: 'Arjun Reddy', avatar: '', xp: 8900, level: 22, streak: 22, badge: '' },
      { rank: 6, name: 'Ananya Gupta', avatar: '', xp: 8200, level: 21, streak: 19, badge: '' },
      { rank: 7, name: 'Vikram Joshi', avatar: '', xp: 7800, level: 20, streak: 17, badge: '' },
      { rank: 8, name: 'Kavya Nair', avatar: '', xp: 7100, level: 19, streak: 15, badge: '' },
      { rank: 9, name: 'Rohan Mehta', avatar: '', xp: 6500, level: 18, streak: 12, badge: '' },
      { rank: 10, name: 'Ishika Das', avatar: '', xp: 5900, level: 17, streak: 10, badge: '' },
    ]);
  }, []);

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>🏆 Leaderboard</motion.h1>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Compete with fellow learners and climb the ranks!</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['global', 'weekly', 'course'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', background: tab === t ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--bg-secondary)', color: tab === t ? '#fff' : 'var(--text-secondary)' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', alignItems: 'flex-end' }}>
          {[leaders[1], leaders[0], leaders[2]].filter(Boolean).map((l, i) => {
            const heights = [140, 180, 120];
            const colors = ['#94a3b8', '#f59e0b', '#cd7f32'];
            const labels = ['2nd', '1st', '3rd'];
            const rank = getRank(l.xp);
            return (
              <motion.div key={l.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${colors[i]}30`, border: `3px solid ${colors[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '22px', fontWeight: 800, color: colors[i] }}>
                  {l.badge || l.name.charAt(0)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{l.name}</div>
                <div style={{ fontSize: '11px', color: rank.color }}>{rank.icon} {rank.name}</div>
                <div style={{ width: '100px', height: `${heights[i]}px`, borderRadius: '12px 12px 0 0', background: `linear-gradient(to top, ${colors[i]}40, ${colors[i]}15)`, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: colors[i] }}>{labels[i]}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{l.xp.toLocaleString()} XP</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Rankings */}
        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {leaders.map((l, i) => {
            const rank = getRank(l.xp);
            return (
              <motion.div key={l.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
                <div style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: l.rank <= 3 ? '18px' : '14px', color: l.rank === 1 ? '#f59e0b' : l.rank === 2 ? '#94a3b8' : l.rank === 3 ? '#cd7f32' : 'var(--text-tertiary)' }}>
                  {l.rank <= 3 ? l.badge : `#${l.rank}`}
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                  {l.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{l.name}</div>
                  <div style={{ fontSize: '12px', color: rank.color }}>{rank.icon} {rank.name} • Level {l.level}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{l.xp.toLocaleString()} XP</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>🔥 {l.streak} day streak</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
