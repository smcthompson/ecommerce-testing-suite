exports.up = function (knex) {
    return knex.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('price').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('products');
};
