import express from 'express';
import { getUsers, updateUser, approveTeacher, getAnalytics, deleteUser, getCourses, updateCourseStatus, deleteCourseAdmin, getSettings, updateSettings } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/teachers/:id/approve', approveTeacher);
router.get('/analytics', getAnalytics);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/courses', getCourses);
router.put('/courses/:id/status', updateCourseStatus);
router.delete('/courses/:id', deleteCourseAdmin);

export default router;
