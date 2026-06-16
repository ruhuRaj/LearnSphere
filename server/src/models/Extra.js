import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'used'], default: 'active' },
  validUntil: { type: Date, required: true },
  usedOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

scholarshipSchema.index({ student: 1 });

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
export const ForumThread = mongoose.model('ForumThread', forumThreadSchema);
export const Certificate = mongoose.model('Certificate', certificateSchema);
