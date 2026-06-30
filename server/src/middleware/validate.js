// server/src/middleware/validate.js
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors/AppError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(new ValidationError(errors));
}

module.exports = validate;