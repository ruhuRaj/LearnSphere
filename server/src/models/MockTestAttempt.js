import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short', 'long'], default: 'mcq' },
  options: { type: [optionSchema], default: [] },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, default: '' },
  marks: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  selectedOption: { type: Number, required: true },
  correct: { type: Boolean, default: false },
  answerText: { type: String, default: '' },
}, { _id: false });

const mockTestAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, index: true },
  studentEmail: { type: String, required: true },
  attemptName: { type: String, default: '' },
  topics: { type: [String], default: [] },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  questions: { type: [questionSchema], default: [] },
  answers: { type: [answerSchema], default: [] },
  score: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  tips: { type: [String], default: [] },
  summary: {
    percentage: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
  },
}, {
  timestamps: true,
  collection: 'mocktestattempts',
});

mockTestAttemptSchema.index({ studentId: 1, createdAt: -1 });

const MockTestAttempt = mongoose.model('MockTestAttempt', mockTestAttemptSchema);

export default MockTestAttempt;
