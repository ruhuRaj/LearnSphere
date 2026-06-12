import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlinePaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>{children}</motion.div>;
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1500);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg-primary)' }}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="section relative z-10 text-center">
          <FadeIn>
            <span className="badge badge-primary mb-4">Contact</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-[Outfit] mb-4" style={{ color: 'var(--text-primary)' }}>Get in <span className="gradient-text">Touch</span></h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Have questions? We'd love to hear from you.</p>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            {[
              { icon: HiOutlineMail, title: 'Email', info: 'hello@learnsphere.com', sub: 'We reply within 24 hours' },
              { icon: HiOutlinePhone, title: 'Phone', info: '+91 123 456 7890', sub: 'Mon–Sat, 9am–6pm IST' },
              { icon: HiOutlineLocationMarker, title: 'Office', info: 'Ranchi, Jharkhand', sub: 'India' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="glass-card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <item.icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                    <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{item.info}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.sub}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.15}>
              <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Name</label>
                    <input className="input" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="How can we help?" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input" rows={5} placeholder="Write your message..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={sending}>
                  {sending ? 'Sending...' : <><HiOutlinePaperAirplane className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
