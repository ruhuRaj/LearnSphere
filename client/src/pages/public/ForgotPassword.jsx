import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email) return 'Email is required';
    if (!password || password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, password });
      toast.success(data.message || 'Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex items-center justify-center px-4 mt-2 mb-16" style={{ minHeight: '70vh' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Enter your email and set a new password below.</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="label">New password</label>
              <input className="input" type="password" placeholder="New password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div>
              <label className="label">Confirm new password</label>
              <input className="input" type="password" placeholder="Confirm new password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-sm text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            Remembered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
