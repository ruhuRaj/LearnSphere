import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  courseCategory: { type: String, required: true, enum: ['JEE', 'NEET', 'CBSE11', 'CBSE12', 'Bihar', 'Jharkhand', 'Bengal'] },
  verifiedEmail: { type: Boolean, default: false },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 100 },
  percentage: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  couponCode: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'active', 'used', 'expired'], default: 'pending' },
  validUntil: { type: Date },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
}, { timestamps: true });

scholarshipSchema.index({ student: 1 });
scholarshipSchema.index({ couponCode: 1 });

const emailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  used: { type: Boolean, default: false },
}, { timestamps: true });

emailOTPSchema.index({ email: 1, expiresAt: 1 });

const forumThreadSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  category: { type: String, enum: ['general', 'doubt', 'discussion', 'announcement', 'resource'], default: 'general' },
  tags: [String],
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isModerated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

forumThreadSchema.index({ course: 1, createdAt: -1 });
forumThreadSchema.index({ title: 'text', content: 'text' });

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, unique: true, required: true },
  completedAt: { type: Date, default: Date.now },
  grade: { type: String },
  score: { type: Number },
  pdfUrl: { type: String },
  qrCode: { type: String },
}, { timestamps: true });

certificateSchema.index({ student: 1 });
certificateSchema.index({ certificateId: 1 });

export const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
export const ScholarshipOTP = mongoose.model('ScholarshipOTP', emailOTPSchema);
export const EmailOTP = mongoose.model('EmailOTP', emailOTPSchema);
export const ForumThread = mongoose.model('ForumThread', forumThreadSchema);
export const Certificate = mongoose.model('Certificate', certificateSchema);
