// server/src/middleware/errorHandler.js
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors/AppError');

// Express identifies this as an error handler by its 4-arg signature.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError && err.isOperational) {
    if (err.statusCode >= 500) logger.error(err.message, { stack: err.stack });
    else logger.warn(`${err.statusCode} ${err.message} (${req.method} ${req.originalUrl})`);

    const body = { success: false, message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // Anything not operational is a bug or unexpected DB error — log fully, expose nothing.
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = errorHandler;