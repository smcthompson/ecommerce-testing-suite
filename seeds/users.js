const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('users').del();
  await knex('users').insert([
    { id: 1, username: 'testUser1', password: await bcrypt.hash('7357[U53R]', 10) },
    { id: 2, username: 'testUser2', password: await bcrypt.hash('7357[U53R]', 10) }
  ]);
};
