const z = require("zod");

const UserSchema = z.object({
  id: z.string().length(21),
  name: z
    .string()
    .min(1, "Имя обязательно.")
    .max(255, "В имени максимум 255 символов."),
  password: z
    .string()
    .min(8, "В пароле минимум 8 символов.")
    .max(255, "В пароле максимум 255 символов."),
  created_at: z.coerce.date(),
});

const RegUserSchema = UserSchema.omit({ id: true, created_at: true });

const LoginUserSchema = UserSchema.pick({ name: true, password: true });

const UserListSchema = z.array(UserSchema);

module.exports = {
  UserSchema,
  RegUserSchema,
  LoginUserSchema,
  UserListSchema,
};
