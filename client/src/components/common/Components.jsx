import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', style = {}, ...props }) {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontWeight: 600, borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', opacity: disabled ? 0.5 : 1, fontFamily: 'inherit',
  };
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' },
    secondary: { background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
    danger: { background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff' },
    success: { background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  };
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={className}
      style={{ ...baseStyle, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '', style = {}, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } : {}}
      className={`glass-card ${className}`}
      style={{ padding: '24px', borderRadius: '16px', ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth, borderRadius: '16px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
        }}
      >
        {title && (
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: '20px', lineHeight: 1,
            }}>×</button>
          </div>
        )}
        <div style={{ padding: '20px' }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px' }) {
  return (
    <div
      className="animate-pulse"
      style={{ width, height, borderRadius, background: 'var(--bg-tertiary)' }}
    />
  );
}

export function Badge({ children, color = '#6366f1', style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      background: `${color}20`, color,
      ...style,
    }}>
      {children}
    </span>
  );
}

export function StatCard({ icon, label, value, trend, color = '#6366f1' }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${color}15`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
          {trend && (
            <div style={{ fontSize: '11px', color: trend > 0 ? '#10b981' : '#ef4444', marginTop: '2px' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
      {description && <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '20px' }}>{description}</p>}
      {action}
    </div>
  );
}
