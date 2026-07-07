const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function getJWTSecret() {
  return process.env.JWT_SECRET || "local_dev_secret_change_me";
}

function createUserId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    getJWTSecret(),
    {
      expiresIn: "7d"
    }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  };
}

module.exports = {
  createUserId,
  hashPassword,
  verifyPassword,
  createToken,
  toPublicUser,
  getJWTSecret
};