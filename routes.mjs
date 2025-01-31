import { resolve } from 'path';
import db from './models/index.mjs';

import initGamesController from './controllers/games.mjs';
import initUserController from './controllers/users.mjs';

export default function bindRoutes(app) {
  // special JS page. Include the webpack index.html file
  const gameController = initGamesController(db);
  const userController = initUserController(db);
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });
  app.get('/home', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });
  app.post('/games', gameController.create);
  app.get('/games/:gameId', gameController.show);
  app.get('/games/:gameId/:turnNum', gameController.showTurn);

  app.put('/game/:gameId/:turnNum/move', gameController.createMove);
  app.put('/game/:gameId/:turnNum/computermove', gameController.computerMove);
  app.put('/game/:gameId/:turnNum/setwinner', gameController.setWinner);
  app.get('/game/:gameId/showlatestturn', gameController.showLatestTurn);
  app.put('/game/:gameId/editplayers', gameController.editPlayers);
  app.post('/signup', userController.create);
  app.post('/login', userController.login);

  app.get('/users', userController.userStatuses);
  app.get('/openrooms', gameController.showOpen);
}
