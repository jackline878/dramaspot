// crypto-helper.js
const { randomBytes, createCipheriv, createDecipheriv } = require('crypto');

// Constants
const ALGO = 'aes-256-ctr';

// Use environment variable or fallback secret key (64 hex characters = 32 bytes)
const HASH_SECRET = process.env.HASH_SECRET || 'b4d23ae0be590af39740e7325c9afdf3b4d23ae0be590af39740e7325c9afdf3';

if (!process.env.HASH_SECRET) {
  console.warn('WARNING: Using fallback HASH_SECRET. Set HASH_SECRET in environment for production.');
}

const KEY = Buffer.from(HASH_SECRET, 'hex');

/**
 * Encrypts a full URL string.
 * @param {string} fullUrl - The full URL to encrypt.
 * @returns {string} - Encrypted token (base64url format).
 */
function encrypt(fullUrl) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(fullUrl, 'utf8'), cipher.final()]);
  const output = Buffer.concat([iv, encrypted]);
  return output.toString('base64url'); // Safe for URLs
}

/**
 * Decrypts an encrypted token back to the original URL.
 * @param {string} token - The encrypted token (base64url).
 * @returns {string} - Decrypted original URL.
 */
function decrypt(token) {
  const buffer = Buffer.from(token, 'base64url');
  const iv = buffer.subarray(0, 16);
  const encrypted = buffer.subarray(16);
  const decipher = createDecipheriv(ALGO, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
