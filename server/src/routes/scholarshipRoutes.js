import express from 'express';
import {
  sendScholarshipOTP,
  verifyScholarshipOTP,
  createScholarshipApplication,
  submitScholarshipTest,
  getScholarshipStatus,
} from '../controllers/scholarshipController.js';

const router = express.Router();

router.post('/send-otp', sendScholarshipOTP);
router.post('/verify-otp', verifyScholarshipOTP);
router.post('/apply', createScholarshipApplication);
router.post('/:id/submit', submitScholarshipTest);
router.get('/:id', getScholarshipStatus);

export default router;
