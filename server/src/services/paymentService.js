/**
 * Payment Service — Business logic for payments (Razorpay / Stripe)
 */

// Create Razorpay order
export const createRazorpayOrder = async ({ amount, currency = 'INR', courseId, userId }) => {
  // In production, use the Razorpay SDK:
  // const Razorpay = require('razorpay');
  // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

  const order = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entity: 'order',
    amount: amount * 100, // Razorpay expects paise
    amount_paid: 0,
    amount_due: amount * 100,
    currency,
    status: 'created',
    notes: { courseId, userId },
    created_at: Date.now(),
  };

  // In production:
  // const order = await instance.orders.create({ amount: amount * 100, currency, receipt: `receipt_${courseId}` });

  return order;
};

// Verify Razorpay payment signature
export const verifyRazorpayPayment = ({ orderId, paymentId, signature }) => {
  // In production, verify using crypto:
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(`${orderId}|${paymentId}`)
  //   .digest('hex');
  // return expectedSignature === signature;

  // For development, always return true
  return !!(orderId && paymentId && signature);
};

// Create Stripe checkout session
export const createStripeSession = async ({ amount, courseName, courseId, userId, successUrl, cancelUrl }) => {
  // In production, use the Stripe SDK:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: [{ price_data: { currency: 'inr', product_data: { name: courseName }, unit_amount: amount * 100 }, quantity: 1 }],
  //   mode: 'payment',
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  //   metadata: { courseId, userId },
  // });

  const session = {
    id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url: successUrl || `${process.env.CLIENT_URL}/student/courses`,
    amount_total: amount * 100,
    currency: 'inr',
    status: 'open',
    metadata: { courseId, userId },
  };

  return session;
};

// Apply coupon/discount
export const applyCoupon = async (couponCode, originalPrice) => {
  // Hardcoded coupons for demo — replace with DB lookup in production
  const coupons = {
    WELCOME20: { discount: 20, type: 'percentage', minPurchase: 500, maxDiscount: 1000 },
    FLAT500: { discount: 500, type: 'flat', minPurchase: 2000 },
    LEARN50: { discount: 50, type: 'percentage', minPurchase: 1000, maxDiscount: 2500 },
  };

  const coupon = coupons[couponCode?.toUpperCase()];
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  if (originalPrice < (coupon.minPurchase || 0)) {
    return { valid: false, message: `Minimum purchase of ₹${coupon.minPurchase} required` };
  }

  let discountAmount;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((originalPrice * coupon.discount) / 100);
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = coupon.discount;
  }

  return {
    valid: true,
    couponCode: couponCode.toUpperCase(),
    discountType: coupon.type,
    discountValue: coupon.discount,
    discountAmount,
    finalPrice: originalPrice - discountAmount,
  };
};
