exports.up = async function (knex) {
    // Drop the session_id column and add user_id
    await knex.schema.table('cart', (table) => {
        table.dropColumn('session_id');
        table.integer('user_id').unsigned().notNullable().defaultTo(0);
        table.foreign('user_id').references('users.id');
    });
};

exports.down = async function (knex) {
    await knex.schema.table('cart', (table) => {
        table.dropColumn('user_id');
        table.string('session_id').notNullable(); // Change the column name here
    });
};
