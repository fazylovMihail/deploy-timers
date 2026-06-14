exports.up = function (knex) {
  return knex.schema.table("timers", (table) => {
    table.renameColumn("start", "start_time");
  });
};

exports.down = function (knex) {
  return knex.schema.table("timers", (table) => {
    table.renameColumn("start_time", "start");
  });
};
