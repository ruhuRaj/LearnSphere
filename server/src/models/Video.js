import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  chapter: { type: String },
  url: { type: String, required: true },
  publicId: { type: String }, // Cloudinary public ID
  duration: { type: Number, default: 0 }, // seconds
  thumbnail: { type: String, default: '' },
  description: { type: String, default: '' },

  // AI Features
  aiSummary: { type: String },
  subtitles: [{ lang: String, url: String }],

  // Ordering
  order: { type: Number, default: 0 },

  // Stats
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },

  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

videoSchema.index({ course: 1, order: 1 });

export default mongoose.model('Video', videoSchema);
