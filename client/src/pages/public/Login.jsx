import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../../features/authSlice';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();

        const { data } = await api.post('/auth/google', {
          name: profile.name,
          email: profile.email,
          googleId: profile.sub,
          avatar: profile.picture,
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          toast.success('Welcome back!');
          window.location.href = data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/teacher' : '/student';
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in was cancelled'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const role = result.payload.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  // Demo login helper
  const demoLogin = (role) => {
    const creds = {
      student: { email: 'student@demo.com', password: 'demo1234' },
      teacher: { email: 'teacher@demo.com', password: 'demo1234' },
      admin: { email: 'admin@demo.com', password: 'demo1234' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="page-container flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="absolute inset-0 gradient-mesh" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-[Outfit]">
              <span className="gradient-text">Learn</span><span style={{ color: 'var(--text-primary)' }}>Sphere</span>
            </span>
          </Link> */}
          <h1 className="text-2xl font-bold font-[Outfit] mt-2" style={{ color: 'var(--text-primary)' }}>Hi, Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to continue learning</p>
        </div>

        <div className="glass-card p-8">
          {/* Google OAuth */}
          <button onClick={() => googleLogin()} disabled={googleLoading} className="btn btn-secondary w-full mb-6 text-sm" style={{ gap: '0.75rem' }}>
            <FcGoogle className="w-5 h-5" /> {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
          <p className="text-xs text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>Google sign-in is available for existing accounts only.</p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input className="input pl-10" type="email" placeholder="your email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input className="input pl-10 pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  {showPw ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" className="w-4 h-4 rounded accent-indigo-500" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>Forgot password?</Link>
            </div>

            {error && <p className="text-sm text-center" style={{ color: 'var(--error)' }}>{error}</p>}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Logins */}
          {/* <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-tertiary)' }}>Quick Demo Login</p>
            <div className="flex gap-2">
              {['student', 'teacher', 'admin'].map((role) => (
                <button key={role} onClick={() => demoLogin(role)} className="btn btn-ghost flex-1 text-xs capitalize" style={{ border: '1px solid var(--border-color)' }}>
                  {role}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        <p className="text-center text-sm mt-2 mb-12" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
}
