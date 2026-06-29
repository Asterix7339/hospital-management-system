// server/src/utils/errors/AppError.js

/**
 * Base operational error. Anything thrown with this is a known, expected
 * failure that maps cleanly to an HTTP status + standard envelope.
 */
class AppError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;          // populated only for 422 field errors
    this.isOperational = true;     // false/undefined => treat as a 500 bug
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError   extends AppError { constructor(m = 'Bad request')                                   { super(400, m); } }
class UnauthorizedError extends AppError { constructor(m = 'Unauthorized — token missing or invalid')       { super(401, m); } }
class ForbiddenError    extends AppError { constructor(m = 'Forbidden — insufficient role permissions')     { super(403, m); } }
class NotFoundError     extends AppError { constructor(m = 'Resource not found')                            { super(404, m); } }
class ConflictError     extends AppError { constructor(m = 'Conflict')                                      { super(409, m); } }
class ValidationError   extends AppError { constructor(errors, m = 'Validation failed')                     { super(422, m, errors); } }
class LockedError       extends AppError { constructor(m = 'Account temporarily locked')                    { super(423, m); } }

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  LockedError,
};