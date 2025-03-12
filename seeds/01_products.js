exports.seed = function (knex) {
    return knex('products').del()
        .then(() => {
            return knex('products').insert([
                { name: 'Laptop', price: 999 },
                { name: 'Mouse', price: 29 }
            ]);
        });
};
