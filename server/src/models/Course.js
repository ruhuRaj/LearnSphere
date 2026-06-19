import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, required: true, enum: ['JEE', 'NEET', 'CBSE11', 'CBSE12', 'Bihar', 'Jharkhand', 'Bengal'] },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  language: { type: String, enum: ['English', 'Hindi', 'Both'], default: 'English' },
  tags: [String],
  subjects: [String],

  // Structure
  chapters: [{
    title: { type: String, required: true },
    order: Number,
    topics: [String],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  }],

  // Stats
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },

  // Status
  isPublished: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Use a different language override field so the `language` property
// on Course documents (which can be 'English'|'Hindi'|'Both') is
// not treated by MongoDB as the text index language override.
courseSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { default_language: 'english', language_override: 'language_override' }
);
courseSchema.index({ category: 1, isPublished: 1, isApproved: 1 });

export default mongoose.model('Course', courseSchema);
