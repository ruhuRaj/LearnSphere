import { Payment } from '../models/Other.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Create payment order
// @route   POST /api/payments/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { courseId, gateway = 'razorpay', couponCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let amount = course.discountPrice || course.price;
    let discount = 0;

    // Apply coupon discount
    if (couponCode) {
      const couponDiscounts = { 'LEARN10': 10, 'WELCOME20': 20, 'SCHOLAR50': 50 };
      const couponDiscount = couponDiscounts[couponCode.toUpperCase()];
      if (couponDiscount) {
        discount = Math.round(amount * couponDiscount / 100);
        amount -= discount;
      }
    }

    // Apply scholarship discount
    const user = await User.findById(req.user._id);
    if (user.scholarshipDiscount > 0) {
      const scholDiscount = Math.round(amount * user.scholarshipDiscount / 100);
      discount += scholDiscount;
      amount -= scholDiscount;
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
      couponCode: couponCode || '',
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
    const coupons = {
      'LEARN10': { discount: 10, description: '10% off' },
      'WELCOME20': { discount: 20, description: '20% off for new users' },
      'SCHOLAR50': { discount: 50, description: '50% scholarship discount' },
      'FLASH30': { discount: 30, description: '30% flash sale' },
    };

    const coupon = coupons[couponCode.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    const discountAmount = Math.round(amount * coupon.discount / 100);
    res.json({
      success: true,
      coupon: {
        code: couponCode.toUpperCase(),
        discount: coupon.discount,
        discountAmount,
        finalAmount: amount - discountAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};
