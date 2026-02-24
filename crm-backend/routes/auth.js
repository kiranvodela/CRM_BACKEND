// routes/auth.js
const express = require('express');
const { check } = require('express-validator');
const { signup, signin, getProfile } = require('../controllers/authController');

const router = express.Router();

// Sign Up Route with validation
router.post('/signup', [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], signup);

// Sign In Route with validation
router.post('/signin', [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
], signin);

// Get Profile Route (protected by middleware in server.js)
router.get('/profile', getProfile);

module.exports = router;
