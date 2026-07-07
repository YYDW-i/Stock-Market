const fs = require("fs");
const path = require("path");

const DEFAULT_DB_PATH = path.join(__dirname, "..", "data", "local-db.json");
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : DEFAULT_DB_PATH;

function createEmptyDB() {
  return {
    users: [],
    saves: {},
    notes: {}
  };
}

function ensureDBFile() {
  const dir = path.dirname(DB_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(createEmptyDB(), null, 2), "utf-8");
  }
}

function readDB() {
  ensureDBFile();

  const raw = fs.readFileSync(DB_PATH, "utf-8");

  if (!raw.trim()) {
    return createEmptyDB();
  }

  const db = JSON.parse(raw);

  db.users = Array.isArray(db.users) ? db.users : [];
  db.saves = db.saves && typeof db.saves === "object" ? db.saves : {};
  db.notes = db.notes && typeof db.notes === "object" ? db.notes : {};

  return db;
}

function writeDB(db) {
  ensureDBFile();

  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmpPath, DB_PATH);
}

module.exports = {
  readDB,
  writeDB,
  DB_PATH
};