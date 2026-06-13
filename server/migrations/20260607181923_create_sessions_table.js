exports.up = function (knex) {
  return knex.schema.createTable("sessions", (table) => {
    table.string("session_id", 21).notNullable();
    table
      .string("user_id", 21)
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("expires_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP + INTERVAL '3 days'"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("sessions");
};
