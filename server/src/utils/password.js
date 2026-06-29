// server/src/utils/password.js
const bcrypt = require('bcryptjs');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);   // salt is generated and embedded automatically
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);  // constant-time comparison
}

module.exports = { hashPassword, comparePassword };