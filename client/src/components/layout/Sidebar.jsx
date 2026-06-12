/**
 * Sidebar — Role-based dashboard sidebar navigation.
 * Uses route config from routes/index.js for consistent navigation.
 */
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getSidebarLinks } from '../../routes/index';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const links = getSidebarLinks(user.role);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="dashboard-sidebar glass-strong"
      style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      {/* Role Badge */}
      <div style={{ padding: '12px 14px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
          {user.role} Panel
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {user.name?.split(' ')[0] || 'User'}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '0 12px 8px' }} />

      {/* Nav Links */}
      {links.map((link) => {
        const isActive = location.pathname === link.path;

        return (
          <Link
            key={link.path}
            to={link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{link.icon}</span>
            <span>{link.label}</span>
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '20px',
                  borderRadius: '0 3px 3px 0',
                  background: 'var(--primary)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      {/* Bottom section */}
      <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          LearnSphere v1.0
        </div>
      </div>
    </motion.aside>
  );
}
