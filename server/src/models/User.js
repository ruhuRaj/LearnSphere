import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, minlength: 6, select: false },
  phone: { type: String },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'teacher', 'admin', 'parent'], default: 'student' },
  status: { type: String, enum: ['active', 'suspended', 'hold', 'pending'], default: 'active' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },

  // Social Auth
  googleId: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // Student specific
  targetExam: { type: String, enum: ['JEE', 'NEET', 'CBSE11', 'CBSE12', 'Bihar', 'Jharkhand', 'Bengal', ''] },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  videoProgress: [{
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    watchedSeconds: { type: Number, default: 0 },
    totalSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  }],

  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [{ name: String, icon: String, earnedAt: Date }],

  // Teacher specific
  bio: { type: String, maxlength: 500 },
  expertise: [String],
  isApproved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  rejectReason: { type: String, default: '' },

  // Scholarship
  scholarshipDiscount: { type: Number, default: 0 },

  // Parent link
  parentOf: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export default mongoose.model('User', userSchema);
