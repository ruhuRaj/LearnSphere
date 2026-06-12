import User from '../models/User.js';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Check existing
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Create user
  const user = await User.create({
    name, email, password, phone,
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

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
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
    },
  });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const { name, phone, targetExam, language, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, targetExam, language, bio },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
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

  let user = await User.findOne({ email });
  if (user) {
    // Link Google if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    // Create new user from Google
    user = await User.create({
      name,
      email,
      googleId,
      avatar: avatar || '',
      authProvider: 'google',
      role: 'student',
      status: 'active',
      password: `google_${googleId}_${Date.now()}`, // placeholder password
    });
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
