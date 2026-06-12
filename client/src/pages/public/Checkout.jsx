import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiShield, FiTag, FiCheckCircle } from 'react-icons/fi';

export default function Checkout() {
  const [step, setStep] = useState('summary'); // summary, payment, success
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [gateway, setGateway] = useState('razorpay');

  // Demo course
  const course = { title: 'JEE Physics Complete Course', teacher: 'Dr. Sharma', price: 4999, discountPrice: 2999, thumbnail: '' };
  const finalPrice = couponApplied ? Math.round(course.discountPrice * (1 - couponApplied.discount / 100)) : course.discountPrice;

  const applyCoupon = () => {
    const coupons = { 'LEARN10': { discount: 10, desc: '10% off' }, 'WELCOME20': { discount: 20, desc: '20% off' }, 'FLASH30': { discount: 30, desc: '30% off' } };
    const found = coupons[coupon.toUpperCase()];
    if (found) setCouponApplied({ ...found, code: coupon.toUpperCase() });
    else alert('Invalid coupon code');
  };

  const handlePayment = () => {
    // In production: call /api/payments/create-order then open Razorpay/Stripe
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginTop: '120px', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>✅</div>
          </motion.div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>You've been enrolled in <strong>{course.title}</strong></p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '24px' }}>Amount paid: ₹{finalPrice.toLocaleString()} • +50 XP earned!</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/student/courses" style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Start Learning →</a>
            <a href="/courses" style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', border: '1px solid var(--border-color)' }}>Browse More</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginTop: '80px' }}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Checkout</motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Left — Course + Payment */}
          <div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📚 Course Details</h3>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '56px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📘</div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{course.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>by {course.teacher}</p>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>💳 Payment Method</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[{ key: 'razorpay', label: '🇮🇳 Razorpay', desc: 'UPI, Cards, Netbanking' }, { key: 'stripe', label: '🌐 Stripe', desc: 'International Cards' }].map(g => (
                  <button key={g.key} onClick={() => setGateway(g.key)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${gateway === g.key ? '#6366f1' : 'var(--border-color)'}`, background: gateway === g.key ? '#6366f110' : 'var(--bg-primary)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{g.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}><FiTag size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Apply Coupon</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code" style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                <button onClick={applyCoupon} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Apply</button>
              </div>
              {couponApplied && (
                <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#10b98115', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheckCircle size={14} /> {couponApplied.code} applied — {couponApplied.desc}
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Try: LEARN10, WELCOME20, FLASH30</p>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Original Price</span>
                  <span style={{ textDecoration: 'line-through' }}>₹{course.price.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Discount</span>
                  <span>-₹{(course.price - course.discountPrice).toLocaleString()}</span>
                </div>
                {couponApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7' }}>
                    <span>Coupon ({couponApplied.code})</span>
                    <span>-₹{(course.discountPrice - finalPrice).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span>₹{finalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={handlePayment} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                <FiCreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Pay ₹{finalPrice.toLocaleString()}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <FiShield size={12} /> 100% Secure Payment • 7-Day Refund Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
