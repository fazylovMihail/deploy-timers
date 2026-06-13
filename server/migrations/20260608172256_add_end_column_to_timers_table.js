exports.up = function (knex) {
  return knex.schema.alterTable("timers", (table) => {
    table.timestamp("end_time", { useTz: true });
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("timers", (table) => {
    table.dropColumn("end_time");
  });
};
