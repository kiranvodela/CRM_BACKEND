// routes/contacts.js
const express = require('express');
const { check } = require('express-validator');
const {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
  exportContacts
} = require('../controllers/contactController');

const router = express.Router();

// Get all contacts (with pagination, search, filter) - Protected by auth middleware
router.get('/', getContacts);

// Create new contact - Protected by auth middleware
router.post('/', [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  check('company')
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  check('status')
    .isIn(['Lead', 'Prospect', 'Customer'])
    .withMessage('Status must be Lead, Prospect, or Customer'),
  check('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], createContact);

// Update contact - Protected by auth middleware
router.put('/:id', [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  check('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  check('company')
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  check('status')
    .isIn(['Lead', 'Prospect', 'Customer'])
    .withMessage('Status must be Lead, Prospect, or Customer'),
  check('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], updateContact);

// Delete contact - Protected by auth middleware
router.delete('/:id', deleteContact);

// Export contacts as CSV - Protected by auth middleware
router.get('/export', exportContacts);

module.exports = router;
