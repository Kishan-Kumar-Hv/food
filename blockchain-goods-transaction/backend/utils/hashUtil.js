const crypto = require('crypto');

function computeHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = computeHash;
