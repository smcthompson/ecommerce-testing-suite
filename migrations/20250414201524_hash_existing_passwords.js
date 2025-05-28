const bcrypt = require('bcrypt');

exports.up = async function (knex) {
  const users = await knex('users').select('id', 'password');
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await knex('users').where('id', user.id).update({ password: hashedPassword });
  }
};

exports.down = function (knex) {
  // No-op: Cannot unhash passwords
  return Promise.resolve();
};
