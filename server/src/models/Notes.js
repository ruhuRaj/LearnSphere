import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  chapter: { type: String },
  content: { type: String }, // Markdown content
  fileUrl: { type: String }, // PDF URL
  localPath: { type: String }, // Local upload path (served via /uploads)
  publicId: { type: String }, // Cloudinary public ID
  type: { type: String, enum: ['pdf', 'markdown', 'ai-generated'], default: 'markdown' },
  subject: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Stats
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },

  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

notesSchema.index({ course: 1 });

export default mongoose.model('Notes', notesSchema);
