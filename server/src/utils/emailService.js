import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"LearnSphere" <${process.env.FROM_EMAIL || 'noreply@learnsphere.com'}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error(' Email failed:', error.message);
    // Don't throw — email failures shouldn't crash the app
    return null;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to LearnSphere! 🎓',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0f23, #1a1a3e); color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px 32px; text-align: center;">
          <h1 style="font-size: 28px; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome to LearnSphere</h1>
          <p style="color: #94a3b8; font-size: 16px; margin: 16px 0;">Hi ${user.name},</p>
          <p style="color: #cbd5e1; line-height: 1.6;">Your account has been created successfully. Start your learning journey with AI-powered courses, mock tests, and personalized study plans.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="display: inline-block; margin-top: 24px; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started →</a>
        </div>
      </div>
    `,
  });
};

/**
 * Send password reset email
 */
export const sendResetEmail = (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Password Reset — LearnSphere',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #fff; border-radius: 16px; padding: 40px 32px;">
        <h2 style="color: #a855f7;">Password Reset Request</h2>
        <p style="color: #cbd5e1;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 32px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none;">Reset Password</a>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};
