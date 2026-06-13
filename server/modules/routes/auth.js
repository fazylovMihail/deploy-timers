const express = require("express");
const knex = require("../db");
const { nanoid } = require("nanoid");
const {
  RegUserSchema,
  LoginUserSchema,
  UserSchema,
} = require("../models/User");
const { ZodError } = require("zod");
const { hash, compare } = require("bcrypt");

const route = express.Router();

const createHash = async (password) => hash(password, 10);

const createSession = async (userId) => {
  const sessionId = nanoid();
  await knex("sessions").insert({
    session_id: sessionId,
    user_id: userId,
  });
  return sessionId;
};

const handleError = (err, res) => {
  console.error(err);

  if (err.code === "23505") {
    return res
      .status(400)
      .json({ error: "Пользователь с таким именем уже существует" });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Ошибка типизации.",
      details: err.issues,
    });
  }

  return res.status(500).json({ error: "Внутренняя ошибка сервера." });
};

route.post("/signup", async (req, res) => {
  try {
    const { name, password } = RegUserSchema.parse(req.body);
    const hashedPassword = await createHash(password);

    const [user] = await knex("users")
      .insert({
        id: nanoid(),
        name,
        password: hashedPassword,
      })
      .returning("*");

    const sessionId = await createSession(user.id);
    return res.json({ sessionId });
  } catch (err) {
    return handleError(err, res);
  }
});

route.post("/login", async (req, res) => {
  try {
    const { name, password } = LoginUserSchema.parse(req.body);
    const rawUser = await knex("users").where({ name }).first();

    const fakeHash =
      "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q6k5QmQf0Q6jQG1M7vJm1m5W4y1K2";
    const passwordToCompare = rawUser ? rawUser.password : fakeHash;
    const isPasswordCorrect = await compare(password, passwordToCompare);

    if (!rawUser || !isPasswordCorrect) {
      return res.status(401).json({ error: "Неправильное имя или пароль." });
    }

    const user = UserSchema.parse(rawUser);
    const sessionId = await createSession(user.id);

    return res.json({ sessionId });
  } catch (err) {
    return handleError(err, res);
  }
});

route.get("/logout", async (req, res) => {
  try {
    const sessionId = req.get("sessionId") || req.query.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: "No session." });
    }

    const deletedCount = await knex("sessions")
      .where({ session_id: sessionId })
      .delete();

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Сессия не найдена." });
    }

    return res.json({});
  } catch (err) {
    return handleError(err, res);
  }
});

module.exports = route;
