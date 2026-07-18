import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const typeIcons = {
    info: '💡', success: '', warning: '⚠️', course: '📚',
    test: '📝', assignment: '📋', live: '🔴', achievement: '🏆', system: '⚙️',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', position: 'relative', padding: '8px',
        }}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#ef4444', color: '#fff', fontSize: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute', top: '100%', right: 0, width: '360px',
              maxHeight: '460px', borderRadius: '12px', overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 100,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                Notifications
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <FiCheckCircle size={14} /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                }}>
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    style={{
                      padding: '12px 16px', display: 'flex', gap: '12px',
                      borderBottom: '1px solid var(--border-color)',
                      background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                      cursor: n.isRead ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>
                      {typeIcons[n.type] || '📌'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: n.isRead ? 400 : 600,
                        fontSize: '13px', color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }} style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', padding: '4px', flexShrink: 0,
                    }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
