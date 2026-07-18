import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiShield, FiTag, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const defaultCourse = {
  title: 'JEE Physics Complete Course',
  teacher: 'Dr. Sharma',
  price: 4999,
  discountPrice: 2999,
  thumbnail: '',
};

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('summary');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [gateway, setGateway] = useState('razorpay');
  const [course, setCourse] = useState(defaultCourse);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('scholarshipCoupon');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.code) {
          setCoupon(parsed.code);
          setCouponApplied({
            code: parsed.code,
            discountPercent: parsed.discountPercent || parsed.discount || 0,
            desc: `${parsed.discountPercent || parsed.discount || 0}% off`,
          });
        }
      } catch (e) {
        localStorage.removeItem('scholarshipCoupon');
      }
    }
  }, []);

  useEffect(() => {
    if (!courseId) return;

    const loadCourse = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/courses/${courseId}`);
        if (data?.course) {
          setCourse({
            title: data.course.title || defaultCourse.title,
            teacher: data.course.teacher?.name || data.course.teacher || defaultCourse.teacher,
            price: Number(data.course.price || defaultCourse.price),
            discountPrice: Number(data.course.discountPrice || data.course.price || defaultCourse.discountPrice),
            thumbnail: data.course.thumbnail || defaultCourse.thumbnail,
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load course details.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const amount = course?.discountPrice ?? course?.price ?? 0;
  const couponPercent = couponApplied ? Number(couponApplied.discountPercent || 0) : 0;
  const finalPrice = couponApplied ? Math.max(0, Math.round(amount * (1 - couponPercent / 100))) : amount;
  const couponAmount = Math.max(0, amount - finalPrice);

  const applyCoupon = async () => {
    if (!coupon) {
      toast.error('Enter a coupon code before applying.');
      return;
    }

    try {
      const { data } = await api.post('/payments/apply-coupon', { couponCode: coupon, amount });
      setCouponApplied({
        code: data.coupon.code,
        discountPercent: data.coupon.discount,
        desc: `${data.coupon.discount}% off`,
      });
      toast.success('Coupon applied successfully.');
    } catch (error) {
      localStorage.removeItem('scholarshipCoupon');
      setCouponApplied(null);
      toast.error(error.response?.data?.message || 'Invalid coupon code.');
    }
  };

  const handlePayment = async () => {
    if (paymentProcessing) return;
    if (!courseId) {
      toast.error('No course selected for checkout.');
      return;
    }

    try {
      setPaymentProcessing(true);
      const orderPayload = {
        courseId,
        gateway,
      };
      if (couponApplied?.code) {
        orderPayload.couponCode = couponApplied.code;
      }

      const { data: orderData } = await api.post('/payments/create-order', orderPayload);
      const { order } = orderData;

      const { data: verifyData } = await api.post('/payments/verify', {
        paymentId: order.paymentId,
        orderId: order.id,
        transactionId: `txn_${Date.now()}`,
      });

      if (verifyData?.success) {
        toast.success('Payment completed and course enrolled successfully.');
        setStep('success');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginTop: '120px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading checkout details…</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="page-container" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginTop: '120px', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}></div>
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
                  <button key={g.key} type="button" onClick={() => setGateway(g.key)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${gateway === g.key ? '#6366f1' : 'var(--border-color)'}`, background: gateway === g.key ? '#6366f110' : 'var(--bg-primary)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{g.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}><FiTag size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Apply Coupon</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code" style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                <button type="button" onClick={applyCoupon} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Apply</button>
              </div>
              {couponApplied && (
                <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#10b98115', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheckCircle size={14} /> {couponApplied.code} applied — {couponApplied.desc}
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Use your scholarship coupon here or enter another valid code.</p>
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
                    <span>-₹{couponAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span>₹{finalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button type="button" onClick={handlePayment} disabled={paymentProcessing} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', cursor: paymentProcessing ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700 }}>
                <FiCreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />{paymentProcessing ? 'Processing...' : `Pay ₹${finalPrice.toLocaleString()}`}
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
