import sequelize from 'sequelize';
import pkg from 'sequelize';
import { flip } from '@popperjs/core';
import { checkError } from '../src/util.mjs';
import * as gameLogic from '../src/game-logic.mjs';

const { Op } = pkg;
const gameStates = {
  black: 'Black\'s turn',
  white: 'White\'s turn',
  end: 'Game has ended',
};

const getCurrTurn = async (db, gameId, turnNum) => {
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
    console.log('gameId, turnNum :>> ', gameId, turnNum);
    console.log('prevGameTurn :>> ', prevGameTurn);
    currGameTurn = await db.Turn.create({
      gameId,
      turnNum,
      gameState: {
        ...prevGameTurn.gameState,
      },
    });
  }
  return currGameTurn;
};

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };
  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    let { userId } = request.cookies;
    const { gameType, playerIsBlack, difficultyLvl } = request.body;

    userId = 1;
    // console.log('userIds :>> ', userId);

    const boardData = gameLogic.startingBoard();
    const validMoves = gameLogic.getValidMoves(boardData, true);
    const gameState = {
      boardData,
      numBlackSeeds: 2,
      numWhiteSeeds: 2,
      gameStatus: gameStates.black,

      validMoves,
    };
    console.log('in game creation');

    let opponentId;
    switch (gameType) {
      case 'local':
        opponentId = userId;
        break;
      case 'computer':
        opponentId = null;
        break;
      default:
        opponentId = request.body.opponentId;
    }
    const blackId = playerIsBlack ? userId : opponentId;
    const whiteId = playerIsBlack ? opponentId : userId;

    try {
      const newGame = await db.Game.create({
        // blackId: userId,
        // whiteId: opponentId,
        blackId,
        whiteId,
      });
      const initTurn = await db.Turn.create({
        gameId: newGame.id,
        gameState,

      });
      response.status(200).send({ initTurn, validMoves });
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
  // const getCurrentTurn = async (gameId, )
  const createMove = async (req, res) => {
    // eslint-disable-next-line prefer-const
    let { rowIndex, colIndex, isBlackTurn } = req.body;
    // eslint-disable-next-line prefer-const
    let { gameId, turnNum } = req.params;
    turnNum = parseInt(turnNum, 10);

    console.log('in createMove');
    try {
      const currGameTurn = await getCurrTurn(db, gameId, turnNum);
      const currentGame = await db.Game.findOne({
        where: {
          id: gameId,
        },
      });

      const { gameState } = currGameTurn;
      const { boardData } = gameState;
      const currentValidMoves = gameState.validMoves;

      const validMove = gameLogic.moveIsValid(rowIndex, colIndex, currentValidMoves);
      const moveCode = gameLogic.moveCodeFromCoord([rowIndex, colIndex]);
      // diff from computer player
      if (validMove === false) {
        res.send({ isValidMove: validMove });
        return;
      }
      if (isBlackTurn) {
        currGameTurn.blackMove = moveCode;
      }
      else {
        currGameTurn.whiteMove = moveCode;
        turnNum += 1;
        const newGameTurn = await db.Turn.create({
          gameId,
          turnNum,
          gameState: {
            ...currGameTurn.gameState,
          },
        });
      }
      const updatedGameBoard = gameLogic.updateGameBoard(boardData, validMove, isBlackTurn);

      let validMoves = gameLogic.getValidMoves(boardData, !isBlackTurn);
      let gameStatus = gameStates[gameLogic.blackOrWhiteFromBool(isBlackTurn)];
      if (validMoves.length === 0) {
        turnNum += 1;
        validMoves = gameLogic.getValidMoves(boardData, isBlackTurn);
        if (validMoves.length === 0) {
          gameStatus = gameStates.end;
          // get winner
          console.log('setting winner on computers move');
          if (updatedGameBoard.numBlackSeeds > updatedGameBoard.numWhiteSeeds)
          {
            currentGame.winner = currentGame.blackPlayer;
          }
          else if (updatedGameBoard.numBlackSeeds < updatedGameBoard.numWhiteSeeds)
          {
            currentGame.winner = currentGame.whitePlayer;
          }
        }
      }
      else {
        isBlackTurn = !isBlackTurn;
        gameStatus = gameStates[gameLogic.blackOrWhiteFromBool(isBlackTurn)];
      }

      currGameTurn.gameState = {
        boardData: updatedGameBoard.boardData,
        validMoves,
        numBlackSeeds: updatedGameBoard.numBlackSeeds,
        numWhiteSeeds: updatedGameBoard.numWhiteSeeds,
        gameStatus,
      };
      await currentGame.save({ fields: ['currentTurn', 'winner'] });

      await currGameTurn.save({ fields: ['whiteMove', 'blackMove', 'gameState'] });
      await currGameTurn.reload();

      res.send({
        turnNum,
        isBlackTurn,
        gameState: currGameTurn.gameState,
        validMoves,
        flippedSeeds: updatedGameBoard.flippedSeeds,
      });
    } catch (e) {
      console.log('error in updating turn');
      checkError(e);
      res.status(500).send('failed in adding move');
    }
  };
  const computerMove = async (req, res) => {
    // eslint-disable-next-line prefer-const
    let { isBlackTurn, difficultyLvl } = req.body;
    // eslint-disable-next-line prefer-const
    let { gameId, turnNum } = req.params;
    turnNum = parseInt(turnNum, 10);

    console.log('in computerMove');
    try {
      const currGameTurn = await getCurrTurn(db, gameId, turnNum);
      const currentGame = await db.Game.findOne({
        where: {
          id: gameId,
        },
      });

      const { gameState } = currGameTurn;
      const { boardData } = gameState;
      const currentValidMoves = gameState.validMoves;

      const validMove = gameLogic.comChooseNextMove(currentValidMoves, difficultyLvl);
      // check if there are validMove

      const moveCode = gameLogic.moveCodeFromCoord(validMove.coord);

      if (isBlackTurn) {
        currGameTurn.blackMove = moveCode;
      }
      else {
        currGameTurn.whiteMove = moveCode;
        turnNum += 1;
      }

      const updatedGameBoard = gameLogic.updateGameBoard(boardData, validMove, isBlackTurn);

      // if opponent has valid moves
      let validMoves = gameLogic.getValidMoves(boardData, !isBlackTurn);
      let gameStatus = gameStates[gameLogic.blackOrWhiteFromBool(isBlackTurn)];
      if (validMoves.length === 0) {
        turnNum += 1;
        validMoves = gameLogic.getValidMoves(boardData, isBlackTurn);
        if (validMoves.length === 0) {
          gameStatus = gameStates.end;
          // get winner
          console.log('setting winner on computers move');
          if (updatedGameBoard.numBlackSeeds > updatedGameBoard.numWhiteSeeds)
          {
            currentGame.winner = currentGame.blackPlayer;
          }
          else if (updatedGameBoard.numBlackSeeds < updatedGameBoard.numWhiteSeeds)
          {
            currentGame.winner = currentGame.whitePlayer;
          }
        }
      }
      else {
        isBlackTurn = !isBlackTurn;
        gameStatus = gameStates[gameLogic.blackOrWhiteFromBool(isBlackTurn)];
      }

      currGameTurn.gameState = {
        boardData: updatedGameBoard.boardData,
        validMoves,
        numBlackSeeds: updatedGameBoard.numBlackSeeds,
        numWhiteSeeds: updatedGameBoard.numWhiteSeeds,
        gameStatus,
      };
      currentGame.currentTurn = turnNum;
      // currentGame.Turn = turnNum;
      await currentGame.save({ fields: ['currentTurn', 'winner'] });
      await currGameTurn.save({ fields: ['whiteMove', 'blackMove', 'gameState'] });
      await currGameTurn.reload();

      res.send({
        turnNum,
        isBlackTurn,
        gameState: currGameTurn.gameState,
        validMoves,
        flippedSeeds: updatedGameBoard.flippedSeeds,
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
    createMove,
    computerMove,
    setWinner,
  };
}
