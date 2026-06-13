exports.up = function (knex) {
  return knex.schema.createTable("timers", (table) => {
    table.string("timer_id", 21).notNullable().primary();
    table
      .string("user_id", 21)
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("start").notNullable().defaultTo(knex.fn.now());
    table.string("description", 255);
    table.boolean("is_active").defaultTo(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("timers");
};
