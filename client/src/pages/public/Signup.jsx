import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser, clearError } from '../../features/authSlice';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap, HiOutlinePhone } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' });
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        // Get user info from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();

        // Send to our backend
        const { data } = await api.post('/auth/google', {
          name: profile.name,
          email: profile.email,
          googleId: profile.sub,
          avatar: profile.picture,
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          toast.success('Welcome to LearnSphere!');
          window.location.href = data.user.role === 'teacher' ? '/teacher' : '/student';
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
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    dispatch(clearError());
    const result = await dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to LearnSphere!');
      const role = result.payload.user.role;
      navigate(role === 'teacher' ? '/teacher' : '/student');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="page-container flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="absolute inset-0 gradient-mesh" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-[Outfit]">
              <span className="gradient-text">Learn</span><span style={{ color: 'var(--text-primary)' }}>Sphere</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Start your learning journey today</p>
        </div>

        <div className="glass-card p-8">
          <button onClick={() => googleLogin()} disabled={googleLoading} className="btn btn-secondary w-full mb-5 text-sm" style={{ gap: '0.75rem' }}>
            <FcGoogle className="w-5 h-5" /> {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          {/* Role Selection */}
          <div className="mb-5">
            <label className="label">I am a</label>
            <div className="flex gap-2">
              {['student', 'teacher'].map((role) => (
                <button key={role} type="button" onClick={() => setForm({ ...form, role })} className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all" style={{ background: form.role === role ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)', border: form.role === role ? '2px solid var(--primary)' : '2px solid transparent', color: form.role === role ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {role === 'student' ? '🎓 ' : '👨‍🏫 '}{role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input className="input pl-10" placeholder="Your full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input className="input pl-10" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input className="input pl-10" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  <input className="input pl-10 pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Confirm</label>
                <div className="relative">
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                    {showPw ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-center" style={{ color: 'var(--error)' }}>{error}</p>}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
