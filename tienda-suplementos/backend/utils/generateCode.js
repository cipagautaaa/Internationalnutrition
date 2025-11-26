const crypto = require('crypto');

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateResetCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = {
  generateVerificationCode,
  generateResetCode
};