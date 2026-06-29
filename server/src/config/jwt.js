// server/src/config/jwt.js
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';

/**
 * @param {{ user_id:number, role_id:number, role_name:string }} payload
 * @returns {string} signed access JWT
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/**
 * @param {string} token
 * @returns {object} decoded payload — THROWS on invalid signature or expiry
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };