exports.up = function (knex) {
    return knex.schema.createTable('cart', table => {
        table.increments('id').primary();
        table.string('session_id').notNullable(); // To identify the user session
        table.integer('product_id').notNullable(); // References the product
        table.integer('quantity').notNullable().defaultTo(1);
        table.foreign('product_id').references('products.id');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('cart');
};
