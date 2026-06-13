const knex = require("../db");

async function findUserBySessionId(sessionId) {
  if (!sessionId) return null;

  const user = await knex("users")
    .join("sessions", "users.id", "sessions.user_id")
    .where("sessions.session_id", sessionId)
    .select("users.*")
    .first();

  return user || null;
}

module.exports = {
  findUserBySessionId,
};
