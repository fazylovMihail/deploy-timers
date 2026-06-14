const { UserSchema } = require("../models/User");
const { findUserBySessionId } = require("../utilits");

const readSessionId = (req) => req.get("sessionId") || req.query.sessionId;

const validateSession = async (req, res, next) => {
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
    if (!validation.success) {
      return next();
    }

    req.sessionId = sessionId;
    req.user = validation.data;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { readSessionId, validateSession };
