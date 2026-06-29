// server/src/utils/apiResponse.js

/**
 * Standard success envelope.
 * @param {object} res
 * @param {number} statusCode  200 | 201 | 204
 * @param {string} message
 * @param {*}      [data]      omitted from body when undefined
 * @param {object} [extra]     e.g. { pagination: {...} }
 */
function sendSuccess(res, statusCode, message, data, extra = {}) {
  const body = { success: true, message, ...extra };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };