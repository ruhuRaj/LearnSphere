import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleTheme } from '../../features/uiSlice';
import { logout } from '../../features/authSlice';
import NotificationCenter from './NotificationCenter';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineAcademicCap,
  HiOutlineCog,
} from 'react-icons/hi';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Scholarship', path: '/scholarship' },
  { name: 'Forum', path: '/forum' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    const paths = { admin: '/admin', teacher: '/teacher', student: '/student' };
    return paths[user.role] || '/student';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'glass-strong shadow-lg'
            : 'bg-transparent'
          }`}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <HiOutlineAcademicCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[Outfit]">
              <span className="gradient-text">Learn</span>
              <span style={{ color: 'var(--text-primary)' }}>Sphere</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: location.pathname === link.path
                    ? 'var(--primary)'
                    : 'var(--text-secondary)',
                }}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: 'var(--primary)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="btn-icon btn-ghost rounded-xl"
              aria-label="Toggle theme"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? (
                <HiOutlineSun className="w-5 h-5" />
              ) : (
                <HiOutlineMoon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationCenter />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full transition-colors"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span
                      className="text-sm font-medium hidden sm:block"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-56 glass-card p-2 z-50"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                      >
                        <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
                          <span className="badge badge-primary mt-1 text-[10px]">{user?.role}</span>
                        </div>
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <HiOutlineUser className="w-4 h-4" /> Dashboard
                        </Link>
                        {user?.role === 'student' && (
                          <>
                            <Link to="/student/leaderboard" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                              🏆 Leaderboard
                            </Link>
                            <Link to="/student/live-classes" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                              🔴 Live Classes
                            </Link>
                            <Link to="/student/certificates" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                              🎓 Certificates
                            </Link>
                          </>
                        )}
                        <Link
                          to={user?.role === 'student' ? '/student/profile' : getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <HiOutlineCog className="w-4 h-4" /> Settings
                        </Link>
                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg w-full transition-colors"
                            style={{ color: 'var(--error)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <HiOutlineLogout className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-secondary)' }}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden btn-icon btn-ghost rounded-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 lg:hidden glass-strong p-6"
              style={{ paddingTop: 'calc(var(--nav-height) + 1rem)' }}
            >
              <div className="flex flex-col gap-1">
                {publicLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-4 py-3 text-sm font-medium rounded-xl transition-colors"
                    style={{
                      color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)',
                      background: location.pathname === link.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <Link to="/login" className="btn btn-secondary w-full">Sign In</Link>
                  <Link to="/signup" className="btn btn-primary w-full">Get Started</Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

