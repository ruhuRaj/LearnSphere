import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser, clearError } from '../../features/authSlice';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap, HiOutlinePhone } from 'react-icons/hi';import api from '../../services/api';import toast from 'react-hot-toast';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' });
  const [showPw, setShowPw] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!form.email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      setOtpLoading(true);
      const { data } = await api.post('/auth/send-otp', { email: form.email });
      if (data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        toast.success('OTP sent to your email');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setVerifyLoading(true);
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp: otpCode });
      if (data.success) {
        setOtpVerified(true);
        toast.success('Email verified successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error('Please verify your email first');
      return;
    }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    dispatch(clearError());
    const result = await dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role, otp: otpCode }));
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
        <div className="text-center mb-6 mt-6">
          {/* <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-[Outfit]">
              <span className="gradient-text">Learn</span><span style={{ color: 'var(--text-primary)' }}>Sphere</span>
            </span>
          </Link> */}
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Start your learning journey today</p>
        </div>

        <div className="glass-card p-8">
          <div className="rounded-xl border p-4 mb-5" style={{ borderColor: 'var(--border-color)', background: 'rgba(99,102,241,0.05)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Google sign-in is for existing accounts only.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Please create your account with email first, then use Google to sign in later.</p>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sign up with email</span>
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
                <input className="input pl-10" type="email" placeholder="your email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="mb-3">
              {!otpSent ? (
                <div className="flex gap-3">
                  <button type="button" onClick={handleSendOtp} className="btn btn-secondary flex-1" disabled={otpLoading}>
                    {otpLoading ? 'Sending OTP...' : 'Verify Email'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <input className="input flex-1" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                  <button type="button" onClick={handleVerifyOtp} className="btn btn-primary" disabled={verifyLoading}>
                    {verifyLoading ? 'Verifying...' : 'Verify'}
                  </button>
                  <button type="button" onClick={handleSendOtp} className="btn btn-ghost" disabled={otpLoading} style={{ marginLeft: 6 }}>
                    {otpLoading ? 'Resending...' : 'Resend'}
                  </button>
                </div>
              )}
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

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading || !otpVerified}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="text-center text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
