import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  topic: { type: String },
  subject: { type: String },
  question: { type: String, required: true },
  aiResponse: { type: String },
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    role: { type: String, enum: ['teacher', 'ai'] },
    status: { type: String, enum: ['approved', 'pending_review', 'removed'], default: 'approved' },
    moderation: {
      flagged: { type: Boolean, default: false },
      isSpam: { type: Boolean, default: false },
      isToxic: { type: Boolean, default: false },
      toxicityScore: { type: Number, default: 0 },
      spamScore: { type: Number, default: 0 },
      reviewedByAdmin: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now },
  }],
  isResolved: { type: Boolean, default: false },
  status: { type: String, enum: ['open', 'answered', 'resolved'], default: 'open' },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'course', 'test', 'assignment', 'live', 'achievement', 'system'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  chapter: { type: String },
  deadline: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  isAIGenerated: { type: Boolean, default: false },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    fileUrl: String,
    score: Number,
    feedback: String,
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
  }],
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  liveClass: { type: mongoose.Schema.Types.ObjectId },
  date: { type: Date, default: Date.now },
  present: { type: Boolean, default: true },
  duration: { type: Number }, // minutes
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  video: { type: mongoose.Schema.Types.ObjectId },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  text: { type: String, required: true },
  status: { type: String, enum: ['approved', 'pending_review', 'flagged', 'removed'], default: 'approved' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative', ''] },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  likes: { type: Number, default: 0 },
  moderation: {
    flagged: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    isToxic: { type: Boolean, default: false },
    toxicityScore: { type: Number, default: 0 },
    spamScore: { type: Number, default: 0 },
    reviewedByAdmin: { type: Boolean, default: false },
  },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  originalAmount: { type: Number },
  discount: { type: Number, default: 0 },
  gateway: { type: String, enum: ['razorpay', 'stripe'], required: true },
  transactionId: { type: String },
  orderId: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  couponCode: { type: String },
}, { timestamps: true });

export const Doubt = mongoose.model('Doubt', doubtSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
export const Comment = mongoose.model('Comment', commentSchema);
export const Payment = mongoose.model('Payment', paymentSchema);

const flaggedCommentSchema = new mongoose.Schema({
  sourceType: { type: String, enum: ['forum_reply', 'doubt_reply', 'comment'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId },
  text: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderation: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const FlaggedComment = mongoose.model('FlaggedComment', flaggedCommentSchema);
