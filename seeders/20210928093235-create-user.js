const jssha = require('jssha');

const { SALT } = process.env;

function getHash(input) {
  // eslint-disable-next-line new-cap
  const shaObj = new jssha('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhasedString = `${input}-${SALT}`;
  shaObj.update(unhasedString);

  return shaObj.getHash('HEX');
}

module.exports = {
  up: async (queryInterface) => {
    const users = ['otter', 'otterpus'];
    const userObjs = users.map((user) => ({
      username: user,
      email: `${user}@gmail.com`,
      password: getHash(user),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('users', userObjs);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
