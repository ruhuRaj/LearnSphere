import { Payment } from '../models/Other.js';
import { Scholarship } from '../models/Extra.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import crypto from 'crypto';

const normalizeCoupon = (code) => String(code || '').trim().toUpperCase();

// @desc    Create payment order
// @route   POST /api/payments/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { courseId, gateway = 'razorpay', couponCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let amount = course.discountPrice || course.price;
    let discount = 0;
    let couponCodeApplied = '';

    // Apply scholarship coupon if present
    if (couponCode) {
      const normalized = normalizeCoupon(couponCode);
      const scholarship = await Scholarship.findOne({
        couponCode: normalized,
        status: 'active',
        validUntil: { $gt: new Date() },
      });
      if (!scholarship) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
      }
      const couponDiscount = scholarship.discountPercent || 0;
      if (couponDiscount > 0) {
        discount = Math.round(amount * couponDiscount / 100);
        amount -= discount;
        couponCodeApplied = normalized;
      }
    }

    amount = Math.max(0, amount);
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount,
      originalAmount: course.price,
      discount,
      gateway,
      orderId,
      couponCode: couponCodeApplied,
      status: 'pending',
    });

    // In production, you'd create Razorpay/Stripe order here
    res.json({
      success: true,
      order: {
        id: orderId,
        paymentId: payment._id,
        amount,
        currency: 'INR',
        courseName: course.title,
        gateway,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId, orderId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // In production, verify with Razorpay/Stripe signature
    payment.transactionId = transactionId || `txn_${Date.now()}`;
    payment.status = 'success';
    await payment.save();

    // Enroll student in course
    const user = await User.findById(payment.user);
    if (!user.enrolledCourses.includes(payment.course)) {
      user.enrolledCourses.push(payment.course);
      user.xp += 50;
      await user.save();
    }

    // Mark scholarship coupon used when payment succeeds
    if (payment.couponCode) {
      const scholarship = await Scholarship.findOne({ couponCode: normalizeCoupon(payment.couponCode) });
      if (scholarship && scholarship.status === 'active') {
        scholarship.status = 'used';
        scholarship.usedBy = payment.user;
        scholarship.usedCourse = payment.course;
        await scholarship.save();
      }
    }

    const course = await Course.findById(payment.course);
    if (course) {
      course.totalStudents += 1;
      await course.save();
    }

    res.json({ success: true, message: 'Payment verified and enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
export const getPaymentHistory = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    const payments = await Payment.find(query)
      .populate('course', 'title thumbnail')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/payments/apply-coupon
export const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, amount } = req.body;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const normalized = normalizeCoupon(couponCode);
    const scholarship = await Scholarship.findOne({
      couponCode: normalized,
      status: 'active',
      validUntil: { $gt: new Date() },
    });

    if (!scholarship) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const discount = scholarship.discountPercent || 0;
    const discountAmount = Math.round(amount * discount / 100);

    res.json({
      success: true,
      coupon: {
        code: normalized,
        discount,
        discountAmount,
        finalAmount: Math.max(0, amount - discountAmount),
        description: `${discount}% off scholarship coupon`,
      },
    });
  } catch (error) {
    next(error);
  }
};
