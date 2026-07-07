require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const { authRequired } = require("./src/middleware/authMiddleware");
const { DB_PATH } = require("./src/db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

const FRONTEND_ROOT = path.join(__dirname, "..");

app.use(cors({
  origin: true
}));

app.use(express.json({
  limit: "2mb"
}));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "GMarket backend is running",
    dbPath: DB_PATH
  });
});

app.use("/api/auth", authRoutes);

app.get("/api/me", authRequired, (req, res) => {
  res.json({
    user: req.user
  });
});

app.use("/api/game", authRequired, gameRoutes);

app.use("/src", express.static(path.join(FRONTEND_ROOT, "src")));
app.use("/docs", express.static(path.join(FRONTEND_ROOT, "docs")));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`GMarket backend running at http://localhost:${PORT}`);
  console.log(`Local database path: ${DB_PATH}`);
});