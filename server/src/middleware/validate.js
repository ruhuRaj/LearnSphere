import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'teacher', 'parent']).withMessage('Invalid role'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Course validations
export const courseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['JEE', 'NEET', 'CBSE11', 'CBSE12', 'Bihar', 'Jharkhand', 'Bengal']).withMessage('Invalid category'),
  body('price').isNumeric().withMessage('Price must be a number'),
  validate,
];

// Test validations
export const testValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration').isNumeric().withMessage('Duration is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  validate,
];

// Doubt validations
export const doubtValidation = [
  body('question').trim().notEmpty().withMessage('Question is required').isLength({ max: 2000 }),
  validate,
];

// Comment validations
export const commentValidation = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 1000 }),
  validate,
];
