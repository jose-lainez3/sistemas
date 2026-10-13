// ============================================================
// Hash y verificacion de contrasenas usando scrypt (modulo
// crypto nativo de Node.js). Equivalente en proposito a
// password_hash()/password_verify() de PHP, sin depender de
// ninguna libreria externa.
// ============================================================
const crypto = require('node:crypto');

const KEYLEN = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const partes = stored.split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const [, salt, hashGuardado] = partes;
  const hashIntento = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  const bufA = Buffer.from(hashIntento, 'hex');
  const bufB = Buffer.from(hashGuardado, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { hashPassword, verifyPassword };
