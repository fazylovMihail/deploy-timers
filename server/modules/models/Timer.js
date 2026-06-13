const z = require("zod");

const TimerSchema = z.object({
  timer_id: z.string().length(21),
  user_id: z.string().length(21),
  start: z.coerce.date(),
  description: z
    .string()
    .max(255, "Описание таймера максимум 255 символов.")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

const TimersListSchema = z.array(TimerSchema);

const CreateTimerBodySchema = TimerSchema.pick({ description: true });

module.exports = {
  TimerSchema,
  TimersListSchema,
  CreateTimerBodySchema,
};
