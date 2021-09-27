import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';

import userModel from './user.mjs';
import gameModel from './game.mjs';
import tipModel from './tip.mjs';
import userStatusModel from './user-status.mjs';
import turnModel from './turn.mjs';

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};
let sequelize;

// If env is production, retrieve database auth details from the
// DATABASE_URL env var that Heroku provides us
if (env === 'production') {
  // Break apart the Heroku database url and rebuild the configs we need
  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);
  const host = dbUrl.hostname;
  const { port } = dbUrl;
  config.host = host;
  config.port = port;
  sequelize = new Sequelize(dbName, username, password, config);
}

// If env is not production, retrieve DB auth details from the config
else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
// add model definitions
db.User = userModel(sequelize, Sequelize.DataTypes);
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.Tip = tipModel(sequelize, Sequelize.DataTypes);
db.status = userStatusModel(sequelize, Sequelize.DataTypes);
db.Turn = turnModel(sequelize, Sequelize.DataTypes);

// each user has multiple games
db.User.hasMany(db.Game, {
  as: 'blackGame',
  foreignKey: 'black_id',
});

db.User.hasMany(db.Game, {
  as: 'whiteGame',
  foreignKey: 'white_id',
});

db.User.hasMany(db.Game, {
  as: 'winnerGame',
  foreignKey: 'winner_id',
});
// one game has one white, one black and one winner
db.Game.belongsTo(db.User, {
  as: 'whitePlayer',
  foreignKey: 'white_id',
});

db.Game.belongsTo(db.User, {
  as: 'blackPlayer',
  foreignKey: 'black_id',
});

db.Game.belongsTo(db.User, {
  as: 'winner',
  foreignKey: 'winner_id',
});
// can call user.getStatus()
db.User.hasOne(db.status);

// can call game.getTurn()
db.Game.hasMany(db.Turn);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
