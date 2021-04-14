const bcrypt = require("bcrypt");

function validatePassword(password) {
  // TODO: add some kind of password policy logic here.

  if (!password || typeof password !== "string" || password.length < 2) {
    throw new Error("New password does not meet requirements.");
  }
}

async function createEncryptedPassword(plaintext) {
  validatePassword(plaintext);

  return await bcrypt.hash(plaintext, 10);
}

async function comparePasswords(encryptedPassword, password) {
  if (!password) {
    return false;
  }

  return await bcrypt.compare(password, encryptedPassword);
}

module.exports = {
  validatePassword,
  createEncryptedPassword,
  comparePasswords
};
