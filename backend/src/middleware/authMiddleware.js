const jwt = require("jsonwebtoken");
const { getJWTSecret } = require("../auth");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "请先登录"
    });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, getJWTSecret());

    req.user = {
      id: payload.id,
      username: payload.username
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "登录状态已失效，请重新登录"
    });
  }
}

module.exports = {
  authRequired
};