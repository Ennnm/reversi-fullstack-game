// const jssha = require('jssha');
import jssha from 'jssha';
import sequelizePackage from 'sequelize';

const { ValidationError, DatabaseError } = sequelizePackage;
const { SALT } = process.env;

export function getHash(input) {
  // eslint-disable-next-line new-cap
  const shaObj = new jssha('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhasedString = `${input}-${SALT}`;
  shaObj.update(unhasedString);

  return shaObj.getHash('HEX');
}

export function checkError(error) {
  if (error instanceof ValidationError) {
    console.error('This is a validation error!');
    console.error('The following is the first error message:');
    console.error(error.errors[0].message);
  } else if (error instanceof DatabaseError) {
    console.error('This is a database error!');
    console.error(error);
  } else {
    console.error(error);
  }
}
