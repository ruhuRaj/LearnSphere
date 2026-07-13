import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { register, login, getMe, updateProfile, logout, googleAuth, forgotPassword, resetPassword, uploadAvatar, sendSignupOTP, verifySignupOTP } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
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
		if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files allowed'));
		cb(null, true);
	},
	limits: { fileSize: 5 * 1024 * 1024 },
});

const handleAvatar = (req, res, next) => {
	upload.single('avatar')(req, res, (err) => {
		if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
		next();
	});
};

const router = express.Router();

router.post('/register', register);
router.post('/send-otp', sendSignupOTP);
router.post('/verify-otp', verifySignupOTP);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, handleAvatar, uploadAvatar);
router.post('/logout', logout);

export default router;
