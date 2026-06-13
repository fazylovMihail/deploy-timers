exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.string("id", 21).notNullable().primary();
    table.string("name", 255).notNullable().unique();
    table.string("password", 60).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
