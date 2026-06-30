import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'subjective', 'numerical', 'true-false', 'fill-in-the-blank'], default: 'mcq' },
  options: [{ text: String, isCorrect: Boolean }],
  correctAnswer: { type: String },
  explanation: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: 1 },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['topic', 'full', 'scholarship', 'daily', 'ai-generated'], default: 'topic' },
  category: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number },
  questions: [questionSchema],
  isAIGenerated: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  scheduledAt: { type: Date },

  // Stats
  totalAttempts: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
}, { timestamps: true });

const testResultSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionIndex: Number, selectedOption: Number, isCorrect: Boolean }],
  score: { type: Number, required: true },
  percentage: { type: Number },
  timeTaken: { type: Number }, // seconds
  weakTopics: [String],
  aiAnalysis: { type: String },
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
export const TestResult = mongoose.model('TestResult', testResultSchema);
