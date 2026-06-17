import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getNotes, createNote, deleteNote } from '../controllers/noteController.js';
import { protect, authorize } from '../middleware/auth.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'notes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const router = express.Router();

const handleFileUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'PDF file too large. Maximum size is 20MB.'
        : err.message || 'File upload failed';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

router.get('/', protect, getNotes);
router.post('/', protect, authorize('teacher', 'admin'), handleFileUpload, createNote);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteNote);

export default router;
