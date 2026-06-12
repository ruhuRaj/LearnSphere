import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  status: { type: String, enum: ['scheduled', 'live', 'ended', 'cancelled'], default: 'scheduled' },
  recordingUrl: { type: String },

  // Room
  roomId: { type: String, unique: true },

  // Stats
  attendeeCount: { type: Number, default: 0 },
  maxAttendees: { type: Number, default: 500 },

  // Features
  chatEnabled: { type: Boolean, default: true },
  pollsEnabled: { type: Boolean, default: true },
  raiseHandEnabled: { type: Boolean, default: true },
}, { timestamps: true });

liveClassSchema.index({ course: 1, scheduledAt: -1 });
liveClassSchema.index({ teacher: 1 });

// Generate room ID before save
liveClassSchema.pre('save', function (next) {
  if (!this.roomId) {
    this.roomId = `room_${this._id}_${Date.now()}`;
  }
  next();
});

export default mongoose.model('LiveClass', liveClassSchema);
