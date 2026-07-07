const express = require("express");
const { readDB, writeDB } = require("../db");
const {
  createUserId,
  hashPassword,
  verifyPassword,
  createToken,
  toPublicUser
} = require("../auth");

const router = express.Router();

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function validateUsername(username) {
  const value = String(username || "").trim();

  if (value.length < 3 || value.length > 20) {
    return "用户名长度应为 3 到 20 个字符";
  }

  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
    return "用户名只能包含中文、英文、数字和下划线";
  }

  return "";
}

function validatePassword(password) {
  const value = String(password || "");

  if (value.length < 6 || value.length > 50) {
    return "密码长度应为 6 到 50 个字符";
  }

  return "";
}

router.post("/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const usernameError = validateUsername(username);
  if (usernameError) {
    return res.status(400).json({ message: usernameError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const db = readDB();
  const normalizedUsername = normalizeUsername(username);

  const existed = db.users.find(
    user => user.normalizedUsername === normalizedUsername
  );

  if (existed) {
    return res.status(409).json({
      message: "这个用户名已经被注册"
    });
  }

  const passwordHash = await hashPassword(password);

  const user = {
    id: createUserId(),
    username,
    normalizedUsername,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  db.saves[user.id] = null;
  db.notes[user.id] = [];

  writeDB(db);

  const token = createToken(user);

  return res.json({
    message: "注册成功",
    token,
    user: toPublicUser(user)
  });
});

router.post("/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const db = readDB();
  const normalizedUsername = normalizeUsername(username);

  const user = db.users.find(
    item => item.normalizedUsername === normalizedUsername
  );

  if (!user) {
    return res.status(401).json({
      message: "用户名或密码错误"
    });
  }

  const ok = await verifyPassword(password, user.passwordHash);

  if (!ok) {
    return res.status(401).json({
      message: "用户名或密码错误"
    });
  }

  const token = createToken(user);

  return res.json({
    message: "登录成功",
    token,
    user: toPublicUser(user)
  });
});

module.exports = router;