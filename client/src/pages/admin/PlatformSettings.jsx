import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiGlobe, FiShield, FiMail, FiDatabase, FiCpu, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PlatformSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: 'LearnSphere', siteTagline: 'AI-Powered Learning Platform',
    maintenanceMode: false, registrationOpen: true, teacherAutoApprove: false,
    maxFileSize: 50, defaultLanguage: 'en', enableAI: true,
    razorpayEnabled: true, stripeEnabled: false, freeTrial: true, freeTrialDays: 7,
    smtpHost: 'smtp.gmail.com', smtpPort: 587, fromEmail: 'noreply@learnsphere.com',
    maxStudentsPerCourse: 500, enableGamification: true, enableForum: true,
  });

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const Section = ({ icon, title, children }) => (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>{children}</div>
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: checked ? '#6366f1' : 'var(--bg-tertiary)', position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  const Input = ({ label, value, onChange, type = 'text', width }) => (
    <div style={{ width }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
    </div>
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        setSettings(data.settings || settings);
      } catch (err) {
        toast.error('Unable to load settings');
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data.settings || settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '1rem' }}>
          <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Platform Settings</motion.h1>
            <p style={{ color: 'var(--text-tertiary)' }}>Configure your LearnSphere platform</p>
          </div>
          <button onClick={saveSettings} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiSave size={14} /> Save Changes
          </button>
        </div>

        <Section icon={<FiGlobe size={18} />} title="General">
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input label="Site Name" value={settings.siteName} onChange={v => update('siteName', v)} width="50%" />
            <Input label="Tagline" value={settings.siteTagline} onChange={v => update('siteTagline', v)} width="50%" />
          </div>
          <Toggle label="Maintenance Mode" desc="Disable access for non-admins" checked={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
          <Toggle label="Open Registration" desc="Allow new users to sign up" checked={settings.registrationOpen} onChange={v => update('registrationOpen', v)} />
        </Section>

        <Section icon={<FiShield size={18} />} title="Access Control">
          <Toggle label="Auto-Approve Teachers" desc="Skip manual review for teacher registrations" checked={settings.teacherAutoApprove} onChange={v => update('teacherAutoApprove', v)} />
          <Input label="Max Students Per Course" value={settings.maxStudentsPerCourse} onChange={v => update('maxStudentsPerCourse', v)} type="number" />
          <Input label="Max Upload Size (MB)" value={settings.maxFileSize} onChange={v => update('maxFileSize', v)} type="number" />
        </Section>

        <Section icon={<FiCpu size={18} />} title="Features">
          <Toggle label="AI Features" desc="Enable AI doubt solver, test generation, content generation" checked={settings.enableAI} onChange={v => update('enableAI', v)} />
          <Toggle label="Gamification" desc="XP, badges, streaks, leaderboards" checked={settings.enableGamification} onChange={v => update('enableGamification', v)} />
          <Toggle label="Community Forum" desc="Enable discussion threads and forum" checked={settings.enableForum} onChange={v => update('enableForum', v)} />
        </Section>

        <Section icon={<FiDollarSign size={18} />} title="Payment">
          <Toggle label="Razorpay" desc="Indian payment gateway" checked={settings.razorpayEnabled} onChange={v => update('razorpayEnabled', v)} />
          <Toggle label="Stripe" desc="International payment gateway" checked={settings.stripeEnabled} onChange={v => update('stripeEnabled', v)} />
          <Toggle label="Free Trial" desc="Allow free trial access before purchase" checked={settings.freeTrial} onChange={v => update('freeTrial', v)} />
        </Section>

        <Section icon={<FiMail size={18} />} title="Email (SMTP)">
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input label="SMTP Host" value={settings.smtpHost} onChange={v => update('smtpHost', v)} width="60%" />
            <Input label="Port" value={settings.smtpPort} onChange={v => update('smtpPort', v)} type="number" width="40%" />
          </div>
          <Input label="From Email" value={settings.fromEmail} onChange={v => update('fromEmail', v)} />
        </Section>
      </div>
    </div>
  );
}
