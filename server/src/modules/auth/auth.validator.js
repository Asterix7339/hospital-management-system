// server/src/modules/auth/auth.validator.js
const { body } = require('express-validator');

const loginRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password needs at least one uppercase letter')
    .matches(/\d/).withMessage('New password needs at least one digit')
    .matches(/[^A-Za-z0-9]/).withMessage('New password needs at least one special character'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm the new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('confirmPassword must match newPassword'),
];

module.exports = { loginRules, changePasswordRules };