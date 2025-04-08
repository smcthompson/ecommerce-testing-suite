exports.seed = async function(knex) {
  await knex('users').del();
  await knex('users').insert([
    { id: 1, username: 'testUser1', password: 'password1' },
    { id: 2, username: 'testUser2', password: 'password2' }
  ]);
};
