exports.seed = async function (knex) {
    await knex('products').del();
    await knex('products').insert([
        { id: 1, name: 'Laptop', price: 999 },
        { id: 2, name: 'Mouse', price: 29 },
    ]);
};
