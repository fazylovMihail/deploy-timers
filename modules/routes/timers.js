const express = require("express");
const { authMiddleware } = require("../middlewares/postValidateSession");
const { CreateTimerBodySchema } = require("../models/Timer");
const knex = require("../db");
const { ZodError } = require("zod");
const { nanoid } = require("nanoid");

const route = express.Router();

route.use(authMiddleware);

const handleError = (err, res) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "Ошибка типизации.", details: err.issues });
  }
  return res.status(500).json({ error: "Внутренняя ошибка сервера." });
};

const formatTimer = (t) => {
  const startTime = new Date(t.start || t.created_at || t.start_time).getTime();
  const endTime =
    t.end_time || t.end ? new Date(t.end_time || t.end).getTime() : null;
  const now = Date.now();

  return {
    id: t.timer_id,
    description: t.description || "",
    start: startTime,
    end: endTime,
    progress: t.is_active ? now - startTime : 0,
    duration: t.is_active ? 0 : endTime ? endTime - startTime : 0,
  };
};

route.get("/", async (req, res) => {
  try {
    const rawTimers = await knex("timers").where({
      user_id: req.user.id,
      is_active: true,
    });

    return res.status(200).json(rawTimers.map(formatTimer));
  } catch (err) {
    return handleError(err, res);
  }
});

route.get("/old", async (req, res) => {
  try {
    const rawTimers = await knex("timers").where({
      user_id: req.user.id,
      is_active: false,
    });

    return res.status(200).json(rawTimers.map(formatTimer));
  } catch (err) {
    return handleError(err, res);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const timer = await knex("timers")
      .where({ user_id: req.user.id, timer_id: req.params.id })
      .first();

    if (!timer) {
      return res
        .status(404)
        .json({ error: `Unknown timer ID ${req.params.id}.` });
    }

    return res.json(formatTimer(timer));
  } catch (err) {
    return handleError(err, res);
  }
});

route.post("/", async (req, res) => {
  try {
    const { description } = CreateTimerBodySchema.parse(req.body);
    const [timer] = await knex("timers")
      .insert({
        timer_id: nanoid(),
        user_id: req.user.id,
        description: description || "",
        start: new Date(),
        is_active: true,
      })
      .returning("*");

    return res.status(201).json({ id: timer.timer_id });
  } catch (err) {
    return handleError(err, res);
  }
});

route.post("/stop/:id", async (req, res) => {
  try {
    const updatedCount = await knex("timers")
      .where({ timer_id: req.params.id, user_id: req.user.id, is_active: true })
      .update({
        is_active: false,
        end_time: new Date(),
      });

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ error: `Unknown timer ID ${req.params.id}.` });
    }

    return res.json({});
  } catch (err) {
    return handleError(err, res);
  }
});

module.exports = route;
