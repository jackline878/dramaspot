// crypto-helper.js
// Usage:
//   const { encrypt, decrypt } = require('./crypto-helper');
//   const token = encrypt(fullImageUrl); // → encrypted filename only
//   const imageUrl = decrypt(token);     // → full Cloudinary URL

const { randomBytes, createCipheriv, createDecipheriv } = require('crypto');

// Constants
const ALGO = 'aes-256-ctr';
const BASE_URL = 'https://res.cloudinary.com/drltycycg/image/upload/v1750508066/my_uploads/';

const KEY = Buffer.from(
  process.env.HASH_SECRET ||
    'b4d23ae0be590af39740e7325c9afdf3b4d23ae0be590af39740e7325c9afdf3',
  'hex'
);

/**
 * Encrypts only the filename (e.g., 1750966414177-Untitledd.png) from full Cloudinary URL
 * @param {string} fullUrl
 * @returns {string} encrypted token
 */
function encrypt(fullUrl) {
  // Extract just the filename after "my_uploads/"
  const parts = fullUrl.split('/my_uploads/');
  if (parts.length < 2) throw new Error('Invalid Cloudinary URL format');
  const filename = parts[1];

  const iv = randomBytes(16);
  const enc = createCipheriv(ALGO, KEY, iv).update(filename, 'utf8');
  const out = Buffer.concat([iv, enc]);
  return out.toString('base64url'); // URL-safe token
}

/**
 * Decrypts token back to full Cloudinary URL
 * @param {string} token
 * @returns {string} full Cloudinary URL
 */
function decrypt(token) {
  const buf = Buffer.from(token, 'base64url');
  const iv = buf.subarray(0, 16);
  const enc = buf.subarray(16);

  const filename = createDecipheriv(ALGO, KEY, iv).update(enc).toString('utf8');

  // Add back the Cloudinary base URL
  return BASE_URL + filename;
}

module.exports = { encrypt, decrypt };
