import sequelize from 'sequelize';
import pkg from 'sequelize';
import { checkError } from '../src/util.mjs';
import * as gameLogic from '../src/game-logic.mjs';

const { Op } = pkg;

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };
  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    let { userId } = request.cookies;
    const { gameType } = request.body;

    userId = 1;
    console.log('userIds :>> ', userId);

    const boardData = gameLogic.startingBoard();
    const gameState = {
      boardData,
      numBlackSeeds: 2,
      numWhiteSeeds: 2,
      gameIsConcluded: false,
    };
    console.log('in game creation');
    let opponentId;
    if (gameType === 'local') {
      opponentId = userId;
    }
    else if (gameType === 'computer')
    {
      opponentId = null;
    }
    else { opponentId = request.body.opponent.id; }
    try {
      const newGame = await db.Game.create({
        blackId: userId,
        whiteId: opponentId,
      });
      const initTurn = await db.Turn.create({
        gameId: newGame.id,
        gameState,
      });
      console.log('gameState :>> ', gameState);
      const emptySpaceArdOpponent = gameLogic.findEmptyArndOpponent(boardData, true);

      response.status(200).send({ initTurn, emptySpaceArdOpponent });
    } catch (error) {
      console.log('error in creating game');
      checkError(error);
      response.status(500).send(error);
    }
  };
  const show = async (req, res) => {
    const { gameId } = req.params;
    try {
      const game = await db.Game.findByPk(gameId);
      res.status(200).send(game);
    } catch (error) {
      console.log('error in showing current game');
      checkError(error);
      res.status(500).send(error);
    }
  };
  const showTurn = async (req, res) => {
    const { gameId, turnNum } = req.params;
    try {
      const gameTurn = await db.Turn.findOne({
        where: {
          gameId,
          turnNum,
        },
      });
      res.status(200).send(gameTurn);

      // send back game status in response
    } catch (error) {
      console.log('error in showing current game status');
      checkError(error);
      res.status(500).send(error);
    }
  };
  const validMoves = async (req, res) => {

  };
  const createMove = async (req, res) => {
    // eslint-disable-next-line prefer-const
    let { colIndex, rowIndex, isBlackTurn } = req.body;
    // eslint-disable-next-line prefer-const
    let { gameId, turnNum } = req.params;
    turnNum = parseInt(turnNum, 10);
    // validation check -> right move?
    const isValid = true;
    console.log('in createMove');
    if (!isValid) {
      res.send({ isValid });
    }
    try {
      const colChar = String.fromCharCode(65 + colIndex);
      const moveCode = `${colChar}${rowIndex + 1}`;

      let currGameTurn = await db.Turn.findOne({
        where: {
          gameId,
          turnNum,
        },
      });
      if (currGameTurn === null) {
        const prevGameTurn = await db.Turn.findOne({
          where: {
            gameId,
            turnNum: turnNum - 1,
          },
        });
        currGameTurn = await db.Turn.create({
          gameId,
          turnNum,
          gameState: { boardData: prevGameTurn.gameState.boardData },
        });
      }
      const { gameState } = currGameTurn;
      const { boardData } = gameState;
      if (isBlackTurn) {
        // update flipped seeds in array
        currGameTurn.blackMove = moveCode;
      // check if white as any moves to make, if not increment turn
      }
      else {
      // reference enough, or need to reassign to gameState?
        currGameTurn.whiteMove = moveCode;
        turnNum += 1;
      }
      boardData[rowIndex][colIndex] = isBlackTurn;
      currGameTurn.gameState = { boardData };
      await currGameTurn.save({ fields: ['whiteMove', 'blackMove', 'gameState'] });
      await currGameTurn.reload();

      // if opponent has valid moves
      isBlackTurn = !isBlackTurn;
      console.log('currGameTurn :>> ', currGameTurn);
      console.log('currGameTurn.gameState :>> ', currGameTurn.gameState.boardData);
      const emptySpaceArdOpponent = gameLogic.findEmptyArndOpponent(boardData, isBlackTurn);

      res.send({
        turnNum, isBlackTurn, gameState, emptySpaceArdOpponent,
      });
    } catch (e) {
      console.log('error in updating turn');
      checkError(e);
      res.status(500).send('failed in adding move');
    }
  };
  const setWinner = async (req, res) => {
    const gameId = req.params.id;
    const { playerId, isWin } = req.body;

    const game = await db.Game.findByPk(gameId);
    let winner;
    if (isWin) {
      winner = await db.User.findByPk(playerId);
    }
    else {
      // not working
      winner = await game.getUsers({
        where: {
          id: {
            [Op.ne]: playerId,
          },
        },
      });
    }
    console.log('winner :>> ', winner);

    game.setWinner(winner.id);
  };
  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    create,
    index,
    show,
    showTurn,
    validMoves,
    createMove,
    setWinner,
  };
}
