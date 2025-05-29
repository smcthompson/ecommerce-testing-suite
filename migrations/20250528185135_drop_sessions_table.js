exports.up = async function(knex) {
    await knex.schema.dropTableIfExists('sessions');
    // Update schema version
    await knex.raw('PRAGMA user_version = 2');
};

exports.down = async function(knex) {
    await knex.schema.createTable('sessions', function(table) {
        table.string('sid').primary();
        table.json('sess').notNullable();
        table.timestamp('expired').notNullable().index();
    });
    // Reset schema version
    await knex.raw('PRAGMA user_version = 1');
};
