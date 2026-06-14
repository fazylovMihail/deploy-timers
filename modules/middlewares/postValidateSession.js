const { readSessionId } = require("./validateSession");
const { findUserBySessionId } = require("../utilits");

const guestMiddleware = async (req, res, next) => {
  try {
    const sessionId = readSessionId(req);
    if (!sessionId) {
      return next();
    }

    const rawUser = await findUserBySessionId(sessionId);
    if (!rawUser) {
      return next();
    }

    const validation = UserSchema.safeParse(rawUser);
    if (validation.success) {
      return res.status(400).json({ error: "Already authenticated." });
    }

    next();
  } catch (err) {
    next(err);
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const sessionId = readSessionId(req);
    if (!sessionId) {
      return res.status(401).json({ error: "No session." });
    }

    const rawUser = await findUserBySessionId(sessionId);
    if (!rawUser) {
      return res.status(401).json({ error: "Invalid session." });
    }

    const validation = UserSchema.safeParse(rawUser);
    if (!validation.success) {
      return res.status(401).json({ error: "Invalid user." });
    }

    req.sessionId = sessionId;
    req.user = validation.data;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  guestMiddleware,
  authMiddleware,
};
