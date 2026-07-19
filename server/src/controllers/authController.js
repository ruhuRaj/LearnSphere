import User from '../models/User.js';
import { EmailOTP } from '../models/Extra.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../utils/emailService.js';

// configure cloudinary from env
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, phone, role, otp } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ success: false, message: 'Name, email, password, and OTP are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const verification = await EmailOTP.findOne({
    email: normalizedEmail,
    code: otp,
    verified: true,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!verification) {
    return res.status(400).json({ success: false, message: 'Email not verified. Please verify the OTP first.' });
  }

  verification.used = true;
  await verification.save();

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    role: role === 'teacher' ? 'teacher' : 'student',
    status: role === 'teacher' ? 'pending' : 'active',
    isApproved: role !== 'teacher',
  });

  const token = user.generateToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, status: user.status,
      xp: user.xp, level: user.level, streak: user.streak,
    },
  });
};

// @desc    Send email OTP for signup verification
// @route   POST /api/auth/send-otp
export const sendSignupOTP = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailOTP.deleteMany({ email: normalizedEmail });
  await EmailOTP.create({ email: normalizedEmail, code, expiresAt, verified: false, used: false });

  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: 'Verify your LearnSphere account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border-radius: 12px; background: #0f172a; color: #fff;">
        <h2 style="margin-bottom: 12px; color: #a78bfa;">Email Verification</h2>
        <p>Your OTP for LearnSphere signup is:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #f8fafc;">${code}</div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    text: `Your LearnSphere signup OTP is ${code}. It expires in 10 minutes.`,
  });

  if (!emailResult) {
    console.log(` Signup OTP for ${normalizedEmail}: ${code}`);
  }

  res.json({ success: true, message: 'OTP sent to your email' });
};

// @desc    Verify email OTP for signup
// @route   POST /api/auth/verify-otp
export const verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const record = await EmailOTP.findOne({
    email: normalizedEmail,
    code: otp,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  record.verified = true;
  await record.save();

  res.json({ success: true, message: 'Email verified successfully' });
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.status === 'suspended' || user.status === 'hold') {
    return res.status(403).json({ success: false, message: 'Account suspended or on hold. Contact support.' });
  }

  // Update streak
  const now = new Date();
  const lastActive = user.lastActive ? new Date(user.lastActive) : null;
  if (lastActive) {
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) { user.streak += 1; }
    else if (diffDays > 1) { user.streak = 1; }
  }
  user.lastActive = now;
  user.xp += 5; // XP for login
  await user.save();

  const token = user.generateToken();

  res.json({
    success: true,
    token,
    user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, status: user.status,
      xp: user.xp, level: user.level, streak: user.streak,
      targetExam: user.targetExam, scholarshipDiscount: user.scholarshipDiscount,
      bio: user.bio,
      expertise: user.expertise,
      language: user.language,
    },
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, status: user.status,
      phone: user.phone, xp: user.xp, level: user.level,
      streak: user.streak, targetExam: user.targetExam,
      enrolledCourses: user.enrolledCourses, badges: user.badges,
      scholarshipDiscount: user.scholarshipDiscount,
      language: user.language,
      bio: user.bio,
      expertise: user.expertise,
    },
  });
};

const normalizeTargetExam = (value) => {
  if (!value) return '';
  const mapping = {
    JEE: 'JEE',
    NEET: 'NEET',
    CBSE11: 'CBSE11',
    CBSE12: 'CBSE12',
    BIHAR: 'Bihar',
    JHARKHAND: 'Jharkhand',
    BENGAL: 'Bengal',
  };
  const normalized = String(value).trim().replace(/\s+/g, '').toUpperCase();
  return mapping[normalized] || '';
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const normalizeLanguage = (value) => {
  if (!value) return 'en';
  const normalized = String(value).trim().toLowerCase();
  const map = {
    english: 'en',
    hindi: 'hi',
    en: 'en',
    hi: 'hi',
  };
  return map[normalized] || 'en';
};

export const updateProfile = async (req, res) => {
  const { name, phone, targetExam, language, bio, expertise, avatar } = req.body;
  const normalizedTargetExam = normalizeTargetExam(targetExam);
  const normalizedLanguage = normalizeLanguage(language);

  const update = { name, phone, targetExam: normalizedTargetExam, language: normalizedLanguage, bio, expertise };
  if (avatar) update.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    update,
    { new: true, returnDocument: 'after', runValidators: true }
  );
  res.json({ success: true, user });
};

// Upload avatar via server -> Cloudinary (signed)
export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const localPath = req.file.path;
  try {
    const result = await cloudinary.v2.uploader.upload(localPath, { folder: 'avatars', use_filename: true });
    const avatarUrl = result.secure_url || result.url;

    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true, runValidators: true });

    // remove local file
    fs.unlink(localPath, () => {});

    res.json({ success: true, user });
  } catch (err) {
    // cleanup
    try { fs.unlinkSync(localPath); } catch (e) {}
    console.error('Cloudinary upload error', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  const { name, email, googleId, avatar } = req.body;
  if (!email || !googleId) {
    return res.status(400).json({ success: false, message: 'Google auth data required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found for this Google email. Please create an account first, then use Google to sign in.',
    });
  }

  if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = 'google';
    if (avatar && !user.avatar) user.avatar = avatar;
    await user.save();
  }

  const token = user.generateToken();
  res.json({
    success: true,
    token,
    user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, status: user.status,
      xp: user.xp, level: user.level, streak: user.streak,
    },
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account with that email' });
  }

  // Generate reset token (simple implementation)
  const crypto = await import('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  console.log(`🔑 Reset token for ${email}: ${resetToken}`);

  // Try to send email (won't crash if SMTP isn't configured)
  try {
    const { sendResetEmail } = await import('../utils/emailService.js');
    await sendResetEmail(email, resetToken);
  } catch {
    console.log('Email service not configured, token logged to console');
  }

  res.json({ success: true, message: 'Password reset link sent to your email' });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.password = password;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
};
