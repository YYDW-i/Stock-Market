const express = require("express");
const crypto = require("crypto");
const { readDB, writeDB } = require("../db");

const router = express.Router();

function createId(prefix) {
  if (crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

router.get("/save", (req, res) => {
  const db = readDB();
  const record = db.saves[req.user.id] || null;

  return res.json({
    save: record ? record.data : null,
    updatedAt: record ? record.updatedAt : null
  });
});

router.put("/save", (req, res) => {
  const save = req.body.save;

  if (!save || typeof save !== "object" || Array.isArray(save)) {
    return res.status(400).json({
      message: "存档数据格式错误"
    });
  }

  const db = readDB();

  db.saves[req.user.id] = {
    data: save,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);

  return res.json({
    message: "存档已保存",
    updatedAt: db.saves[req.user.id].updatedAt
  });
});

router.delete("/save", (req, res) => {
  const db = readDB();

  db.saves[req.user.id] = null;

  writeDB(db);

  return res.json({
    message: "存档已删除"
  });
});

router.get("/notes", (req, res) => {
  const db = readDB();
  const notes = db.notes[req.user.id] || [];

  return res.json({
    notes
  });
});

router.post("/notes", (req, res) => {
  const content = String(req.body.content || "").trim();

  if (!content) {
    return res.status(400).json({
      message: "输入内容不能为空"
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      message: "输入内容不能超过 1000 字"
    });
  }

  const db = readDB();

  if (!Array.isArray(db.notes[req.user.id])) {
    db.notes[req.user.id] = [];
  }

  const note = {
    id: createId("note"),
    content,
    createdAt: new Date().toISOString()
  };

  db.notes[req.user.id].unshift(note);

  writeDB(db);

  return res.json({
    message: "内容已保存",
    note
  });
});

router.delete("/notes/:noteId", (req, res) => {
  const db = readDB();
  const notes = db.notes[req.user.id] || [];

  db.notes[req.user.id] = notes.filter(note => note.id !== req.params.noteId);

  writeDB(db);

  return res.json({
    message: "内容已删除"
  });
});

module.exports = router;