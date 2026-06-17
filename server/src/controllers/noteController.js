import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Notes from '../models/Notes.js';
import Course from '../models/Course.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getNotes = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const enrolledCourseIds = req.user.enrolledCourses || [];
      query.course = { $in: enrolledCourseIds };
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }

    const notes = await Notes.find(query)
      .populate('course', 'title category teacher')
      .populate('teacher', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const noteData = {
      title: req.body.title,
      course: req.body.course,
      chapter: req.body.chapter,
      content: req.body.content,
      teacher: req.user._id,
      subject: req.body.subject || course.subject || course.category,
      type: req.file ? 'pdf' : req.body.type || 'markdown',
      isPublished: true,
    };

    console.log('NOTE UPLOAD - req.file', req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, path: req.file.path } : null);

    if (req.file) {
      // keep local path so we can serve as a fallback if CDN delivery is blocked
      noteData.localPath = `/uploads/notes/${path.basename(req.file.path)}`;
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'raw',
        folder: 'learn-sphere/notes',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      console.log('NOTE UPLOAD - uploadResult', uploadResult);
      noteData.fileUrl = uploadResult.secure_url;
      noteData.publicId = uploadResult.public_id;

      // Do not remove the local copy immediately so the app can fall back to
      // serving `/uploads/notes/...` if Cloudinary blocks delivery for this asset.
    }

    const note = await Notes.create(noteData);

    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    if (note.publicId) {
      try {
        await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
      } catch (destroyErr) {
        console.warn('Cloudinary delete failed:', destroyErr.message);
      }
    }

    // Prefer removing local copy if present
    if (note.localPath) {
      const relativePath = note.localPath.replace(/^\//, '');
      const absolutePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (e) {
          console.warn('Failed to remove local note file:', e.message);
        }
      }
    } else if (note.fileUrl) {
      // legacy handling: if fileUrl was a local path string
      const relativePath = note.fileUrl.replace(/^\//, '');
      const absolutePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (e) {
          console.warn('Failed to remove legacy local file:', e.message);
        }
      }
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};
