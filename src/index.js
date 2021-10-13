import axios from 'axios';
import { AsyncIterator } from 'regenerator-runtime/runtime';
import { Modal } from 'bootstrap';
import './styles.scss';
import { io } from 'socket.io-client';

const socket = io();

socket.on('disconnect', (reason) => {
  console.log(`disconnect due to ${reason}`);
});
socket.on('connect', (reason) => {
  console.log(`connect due to ${reason}`);
});
socket.on('connect_error', (err) => { console.log(`connect_error due to ${err.message}`); });

const headerContainer = document.querySelector('#header-container');
const gameContainer = document.querySelector('#game-container');
const infoContainer = document.querySelector('#info-container');
const secInfoContainer = document.querySelector('#sec-info-container');
const statusContainer = document.querySelector('#status-container');
const actionContainer = document.querySelector('#action-container');
const modalContainer = document.querySelector('#modal-container');

gameContainer.classList.add('relative');
// game data
let playerIsBlack = true;
let isBlackTurn = true;
let gameId;
let turnNum;
let opponentId;
let coordValidMoves;
let gameType;
let difficultyLvl;
let userId;
const gameEnded = false;
const boardSize = 8;
const GAMEHASENDED = 'Game has ended';

const renderScoreInfo = (numBlackSeeds, numWhiteSeeds) => {
  infoContainer.innerText = `Black: ${numBlackSeeds}  White: ${numWhiteSeeds}`;
};

const endGame = (numBlackSeeds, numWhiteSeeds) => {
  // background animation
  // info-container: 'Victory!" 'You have lost" "Save-scum"
  // most significant turn. animate change in seed poccession on board /game highlights
  // or corners taken
  // expandale. Other significant turns, click to show on board
  // main btn

  let endgameMesg;
  let blackIsWinner;
  if (numBlackSeeds > numWhiteSeeds) {
    endgameMesg = 'Black wins!';
    blackIsWinner = true;
  } else if (numBlackSeeds < numWhiteSeeds) {
    endgameMesg = 'White wins!';
    blackIsWinner = false;
  } else {
    endgameMesg = 'Its a tie';
    blackIsWinner = null;
  }
  statusContainer.innerText = endgameMesg;
  secInfoContainer.innerText = '';
  // send back to server who is the winner
  mainPage();
  axios
    .put(`/game/${gameId}/${turnNum}/setwinner`, { blackIsWinner })
    .then((response) => {

    }).catch((e) => { console.log('error in setting winner', e); });
};

const renderGameStatusInfo = (gameStatus, numBlackSeeds, numWhiteSeeds) => {
  if (gameStatus === GAMEHASENDED) {
    endGame(numBlackSeeds, numWhiteSeeds);
  } else {
    statusContainer.innerText = gameStatus;
  }
};

const addToCell = (isBlackSeed, rowIndex, colIndex) => {
  const cell = document.querySelector(`#seed_${rowIndex}_${colIndex}`);
  // true is black seed, false is white seed, null is no seed
  const seed = isBlackSeed
    ? '<div class="seed" onclick="event.cancelBubble=true;"></div>'
    : '<div class="seed white" onclick="event.cancelBubble=true;"></div>';
  cell.innerHTML += seed;
};
const initBoardElem = () => {
  const table = document.createElement('table');
  table.id = 'boardGrid';
  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    boardRow.id = `row_${i}`;
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      boardCell.classList.add('board-colors');
      boardCell.id = `square_${i}_${j}`;
    }
  }
  return table;
};
const initSeedElem = () => {
  const table = document.createElement('table');
  table.id = 'seedGrid';
  table.classList.add('seed-grid');

  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    boardRow.id = `row_${i}`;
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      boardCell.id = `seed_${i}_${j}`;
    }
  }
  return table;
};
const initMovesGrid = () => {
  const table = document.createElement('table');
  table.id = 'moveGrid';

  table.classList.add('potential-moves-grid');
  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      boardCell.id = `move_${i}_${j}`;
    }
  }
  return table;
};
const initFlippedGrid = () => {
  const table = document.createElement('table');
  table.id = 'flipGrid';

  table.classList.add('potential-moves-grid');
  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      boardCell.id = `flip_${i}_${j}`;
    }
  }
  return table;
};
const initClickGrid = () => {
  const table = document.createElement('table');
  table.id = 'click-grid';
  table.classList.add('click-grid');
  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      boardCell.id = `click_${i}_${j}`;
      boardCell.addEventListener('click', clickOnCell);
    }
  }
  return table;
};
const removeElemById = (id, container) => {
  const element = document.querySelector(`#${id}`);
  if (element !== null) {
    container.removeChild(element);
  }
};
const renderBoard = (boardData) => {
  // re-renders board
  removeElemById('seedGrid', gameContainer);
  gameContainer.appendChild(initSeedElem());
  console.log('reloading board');
  // run through board data, fill board
  for (let i = 0; i < boardData.length; i += 1) {
    const refRow = boardData[i];
    for (let j = 0; j < refRow.length; j += 1) {
      const refCell = refRow[j];
      if (refCell !== null) {
        addToCell(refCell, i, j);
      }
    }
  }
};
const renderMoveGrid = (e) => {
  if (e.key !== ' ') {
    return;
  }
  removeElemById('moveGrid', gameContainer);
  gameContainer.appendChild(initMovesGrid());

  coordValidMoves.forEach((coord) => {
    const [i, j] = coord;
    const moveCell = document.querySelector(`#move_${i}_${j}`);
    if (isBlackTurn === true) {
      moveCell.classList.add('highlight-cell-black');
    } else if (isBlackTurn === false) {
      moveCell.classList.add('highlight-cell-white');
    }
  });
};

const flippedSeedsGrid = (flippedSeeds) => {
  console.log('flippedSeeds :>> ', flippedSeeds);

  removeElemById('flipGrid', gameContainer);

  gameContainer.appendChild(initFlippedGrid());
  flippedSeeds.forEach((coord) => {
    const [i, j] = coord;
    console.log('coord in flippedSeedGrid :>> ', coord);
    const flipCell = document.querySelector(`#flip_${i}_${j}`);
    flipCell.classList.add('highlight-new-seeds');
  });
};

document.addEventListener('keydown', renderMoveGrid);
document.addEventListener('keyup', (e) => {
  if (e.keyCode !== 32) {
    return;
  }
  removeElemById('moveGrid', gameContainer);
});

const renderGameState = (gameState) => {
  const {
    boardData, numBlackSeeds, numWhiteSeeds, gameStatus,
  } = gameState;
  console.log('boardData :>> ', boardData);
  renderBoard(boardData);
  renderScoreInfo(numBlackSeeds, numWhiteSeeds);
  renderGameStatusInfo(gameStatus, numBlackSeeds, numWhiteSeeds);
};
const computerMove = () => {
  console.log('computermove');
  console.log('isBlackTurn :>> ', isBlackTurn);
  setTimeout(() => {
    axios
      .put(`/game/${gameId}/${turnNum}/computermove`, {
        isBlackTurn,
        difficultyLvl,
      })
      .then((response) => {
        turnNum = response.data.turnNum;
        const prevTurn = isBlackTurn;
        isBlackTurn = response.data.isBlackTurn;
        // change of turn
        // get computer to play
        const { gameState, validMoves, flippedSeeds } = response.data;

        renderGameState(gameState);
        removeElemById('moveGrid', gameContainer);
        flippedSeedsGrid(flippedSeeds);
        coordValidMoves = validMoves.map((move) => move.coord);
        if (prevTurn === isBlackTurn && gameState.gameStatus !== GAMEHASENDED) {
          computerMove();
        }
      })
      .catch((err) => console.log('error in computer making a move '));
  }, 500);
};
const clickOnCell = (e) => {
  console.log('playerIsBlack :>> ', playerIsBlack);
  console.log('isBlackTurn :>> ', isBlackTurn);
  if (playerIsBlack !== isBlackTurn && gameType === 'online') {
    return;
  }
  const cell = e.target;
  const cellId = cell.id;
  const [rowIndex, colIndex] = cellId
    .split('_')
    .slice(1)
    .map((x) => parseInt(x, 10));

  const seedCell = document.querySelector(`#square_${rowIndex}_${colIndex}`);

  if (seedCell.innerHTML !== '') {
    return;
  }
  console.log('in click on grid');
  console.log('gameType :>> ', gameType);

  // send
  axios
    .put(`/game/${gameId}/${turnNum}/move`, { isBlackTurn, colIndex, rowIndex })
    .then((response) => {
      console.log('response.data in clickonCell:>> ', response.data);
      if (response.data.isValidMove === false) {
        return;
      }
      turnNum = response.data.turnNum;
      // change of turn
      // get computer to play
      const { gameState, validMoves, flippedSeeds } = response.data;
      console.log('flippedSeeds :>> ', flippedSeeds);
      removeElemById('moveGrid', gameContainer);

      renderGameState(gameState);
      flippedSeedsGrid(flippedSeeds, isBlackTurn);
      const prevTurn = isBlackTurn;

      isBlackTurn = response.data.isBlackTurn;

      coordValidMoves = validMoves.map((move) => move.coord);
      console.log('gameType :>> ', gameType);
      if (gameType === 'computer' && prevTurn !== isBlackTurn && gameState.gameStatus !== GAMEHASENDED) {
        console.log('asking computer to move');
        computerMove();
      }

      if (gameType === 'online') {
        socket.emit('reload-board', {
          isBlackTurn, gameState, validMoves, flippedSeeds, turnNum, gameId,
        });
      }
    })
    .catch((err) => console.log('error in clickOnCell:>> ', err));
};
socket.on('reload-board', (board) => {
  isBlackTurn = board.isBlackTurn;
  turnNum = board.turnNum;
  gameId = board.gameId;
  console.log('reloading board :>> ', board);
  console.log('playerIsBlack :>> ', playerIsBlack);
  console.log('turnNum :>> ', turnNum);
  console.log('gameId :>> ', gameId);

  const { gameState, validMoves, flippedSeeds } = board;
  renderGameState(gameState);
  flippedSeedsGrid(flippedSeeds, isBlackTurn);

  coordValidMoves = validMoves.map((move) => move.coord);
});

const initGame = async (gameType, opponentId = null) => {
  // booleanArray true: black, false: white, undefined/null: empty
  // initiator is black
  gameContainer.innerHTML = '';

  await axios
    .post('/games', {
      gameType,
      opponentId,
      playerIsBlack,
    })
    .then((response) => {
      const turnData = response.data.initTurn;
      const { validMoves } = response.data;
      // validMoves is a list of objects container coord, direction with coord
      coordValidMoves = validMoves.map((move) => move.coord);
      const { gameState } = turnData;
      gameId = turnData.gameId;
      turnNum = turnData.turnNum;
      renderGameState(gameState);

      gameContainer.appendChild(initClickGrid());
      gameContainer.appendChild(initBoardElem());
    }).catch((e) => console.log('error in initGame:>> ', e));
};
const removeModal = () => {
  document.body.classList.remove('modal-open');
  const allBackdropElem = document.querySelectorAll('.modal-backdrop');
  allBackdropElem.forEach((elem) => {
    const parent = elem.parentNode;
    parent.removeChild(elem);
  });
  modalContainer.innerHTML = '';
};

const initComGame = async () => {
  isBlackTurn = true;
  gameType = 'computer';
  playerIsBlack = true;

  difficultyLvl = document.querySelector('#difficultyRange').value;
  console.log('difficultyLvl :>> ', difficultyLvl);
  console.log('in p vp computer');

  // in computer player, all created moves by black will receive a reaction move from com
  removeModal();
  await initGame(gameType);
  // need to await initGame  or put the different status msg in init game
  secInfoContainer.innerText = 'Game started against computer. You/Black starts first';
  actionContainer.innerHTML = '';
  actionContainer.appendChild(initLocalMultiplayerBtn());
  actionContainer.appendChild(initFindMatchBtn());

  // init game
  // game board
  // fill info-container (who moves)
  // fill container (black seeds, white seeds)
  // expandable: previous moves, changes in seed numbers -> extract most impactful move
  // undo btn -> undo > 3 times: labelled as save scum, save boards of shame
  // surrender btn -> end game
};
const initLocalGame = () => {
  isBlackTurn = true;
  playerIsBlack = true;

  console.log('in multiplayer local');
  initGame('local');

  secInfoContainer.innerText = 'Game started locally, black starts first';
  actionContainer.innerHTML = '';
  actionContainer.appendChild(initPlayAgstComBtn());
  actionContainer.appendChild(initFindMatchBtn());

  // black player
  // white player
};

const comOptionsModal = () => {
  // easy, medium, hard (1,2,3)
  // show moves toggle
  // save btn (update user_option table)
  // play btn (start computer vs player game)

  const optionsHTML = `<div class="modal fade" id="optionsModal" tabindex="-1" aria-labelledby="optionsModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="optionsModalLabel">Options</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div>
            <div class="mb-3">
              <label for="difficultyRange" class="form-label">Difficulty: </label>
              <div class = "d-flex justify-content-between">
                <div>Easy</div>
                <div>Medium</div>
                <div>Hard</div>
              </div>
              <input type="range" class="form-range" min="0" max="2" step="1" id="difficultyRange">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
          <button type="button" id="startBtn" class="btn btn-info">Start</button>
        </div>
      </div>
    </div>
  </div>`;

  modalContainer.innerHTML = optionsHTML;
  const innerStartBtn = document.getElementById('startBtn');

  innerStartBtn.addEventListener('click', initComGame);
};
const activateBoard = () => {
  gameContainer.appendChild(initClickGrid());
  const startGameBtn = document.getElementById('startGameBtn');
  actionContainer.removeChild(startGameBtn);
  console.log('activating the board');
};

const initOnlineGame = async () => {
  isBlackTurn = true;
  gameType = 'online';
  playerIsBlack = true;
  removeModal();

  await initGame('online');
  const clickGrid = document.getElementById('click-grid');
  console.log('clickGrid :>> ', clickGrid);
  // init game is happening async
  gameContainer.removeChild(clickGrid);

  secInfoContainer.innerText = ' Waiting for opponent to join.';
  actionContainer.innerHTML = '';
  actionContainer.appendChild(initLocalMultiplayerBtn());
  actionContainer.appendChild(initPlayAgstComBtn());
  //   actionContainer.appendChild(playAgstComBtn);
  // // -> lead to page with all users where player can pick their opponent
  // actionContainer.appendChild(findMatchBtn);
  // status container username/color's turn
  // deactivate clicking board while waiting for opponent to arrive
  // when opponent joins and click 'startgame'
  // clicking board is activated
  // game is started, black gets to click on the board <-press start, emit to other player that they can start playing

  // modal popout sent to black to tell them their game has started
  // black can click on button to start game. if isBlackTurn and playerIsBlack
  // if click is valid, 'black moved' sent to white for white's board to update
  // vice versa
};

socket.on('online-game', (msg) => {
  console.log('received message to start', msg);
  console.log('userId :>> ', userId);
  if (msg.whiteId !== userId) {
    console.log('black :>> ', userId);

    secInfoContainer.innerText = 'Game started, you play black';
  }
  else {
    console.log('white, userId :>> ', userId);

    secInfoContainer.innerText = 'Game started, you play white';
    // After black clicks, get both servers to refresh board from database according to latest turns, emit that its white turn aka isBlackTurn=false
    // Disable black click board
    // enable white click board
    // render white valid moves
  }
  gameContainer.appendChild(initClickGrid());
});

const startRoomGame = () => {
// how much info to store as cookies/params and how much as local variables
// x has joined the room
// send message to black
  gameType = 'online';
  socket.emit('online-game', { gameId, whiteId: userId });

  secInfoContainer.innerText = 'Game has started, black goes first';

  activateBoard();
};

const joinRoom = (game) => {
  isBlackTurn = true;
  playerIsBlack = false;
  gameType = 'online';
  coordValidMoves = [];
  removeElemById('flipGrid', gameContainer);
  removeModal();
  console.log('game :>> ', game);
  // update opponent name in database for game
  axios.put(`/game/${game.gameId}/editplayers`)
    .then((response) => {
      console.log('response in join room :>> ', response);
    })
    .catch((e) => {
      console.log('error in joining game room', e);
    });
  axios.get(`/game/${game.gameId}/showlatestturn`)
    .then((response) => {
      const { gameTurn } = response.data;
      renderGameState(gameTurn.gameState);

      const clickGrid = document.getElementById('click-grid');
      gameContainer.removeChild(clickGrid);
    }).catch((e) => {
      console.log('error with getting and rendering next turn', e);
    });
  actionContainer.innerHTML = '';
  actionContainer.appendChild(initLocalMultiplayerBtn());
  actionContainer.appendChild(initPlayAgstComBtn());
  actionContainer.appendChild(initStartMultiplayerBtn());

  // '/games/:gameId'
  // render gameboard based on latest game turn
  // enable black to click grid
  console.log('asked userId to play :>> ', game);
};

const usersModal = () => {
  // easy, medium, hard (1,2,3)
  // show moves toggle
  // save btn (update user_option table)
  // play btn (start computer vs player game)

  const usersHTML = `<div class="modal fade " id="usersModal" tabindex="-1" aria-labelledby="optionsModalLabel" aria-hidden="true">
    <div class="modal-dialog " style="max-width:1000px">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">Game rooms</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body ">
          <div>
            <div class="mb-3">
              <table id ="game-room-table">
                <tr>
                  <th>Game master</th>
                  <th>User status</th>
                  <th>Created</th>
                  <th>Join</th>
                </tr>
                <div>
              </div>
              </table>
              <button class="btn btn-info justify-content-end" id="create-room-btn">Create room</button>
            </div>
          </div>
        </div>
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">Online</h5>
        </div>

        <div class="modal-body"  >
          <div>
            <div class="mb-3">
              <table id ="online-users-table">
                <tr>
                  <th>Otter</th>
                  <th>Rank (W/L/T)</th>
                  <th>Status</th>
                  <th>Last seen</th>
                </tr>
                <div >
              </div>
              </table>
            </div>
          </div>
        </div>

       
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`;

  modalContainer.innerHTML = usersHTML;
  // create challenge button for each user
  const gameRoomContainer = document.getElementById('game-room-table');

  const onlineUsersContainer = document.getElementById('online-users-table');
  // axios get recent open games
  axios.get('/openrooms')
    .then((response) => {
      const { openGames } = response.data;
      console.log('openGames :>> ', openGames);
      openGames.forEach((game) => {
        const tableRow = document.createElement('tr');
        gameRoomContainer.appendChild(tableRow);
        tableRow.innerHTML += `
        <td class="user-table">${game.blackUserName}</td>
        <td class="user-table">${game.blackInGame ? 'In game' : 'Available'}</td>
        <td class="user-table">${game.createdAt}</td>
        `;
        const challengeUserData = document.createElement('td');
        challengeUserData.classList.add('user-table', 'text-center');

        const challengeUserBtn = document.createElement('button');
        challengeUserBtn.classList.add('btn', 'btn-info');
        challengeUserBtn.innerText = 'Join';
        challengeUserBtn.addEventListener('click', () => { joinRoom(game); });

        challengeUserData.appendChild(challengeUserBtn);
        tableRow.appendChild(challengeUserData);
      });
    }).catch((e) => {
      console.log('error in getting open rooms ', e);
    });
  const createMultiplayerOnlineBtn = document.getElementById('create-room-btn');
  createMultiplayerOnlineBtn.addEventListener('click', initOnlineGame);
  // axios get online player
  axios.get('/users')
    .then((response) => {
      const { onlineUsers, offlineUsers } = response.data;
      onlineUsers.forEach((user) => {
        // 'online users'
        const tableRow = document.createElement('tr');
        onlineUsersContainer.appendChild(tableRow);
        tableRow.innerHTML += `
        <td class="user-table">${user.username}</td>
        <td class="user-table">${user.userId}</td>
        <td class="user-table">${user.status}</td>
        <td class="user-table">${user.lastActive}</td>
        `;
      });
    }).catch((e) => {
      console.log('error in getting online players', e);
    });
};
const initStartMultiplayerBtn = () => {
  const startGameBtn = document.createElement('button');
  startGameBtn.classList.add('btn', 'btn-info', 'm-1');
  startGameBtn.id = 'startGameBtn';
  startGameBtn.innerText = 'Start game';
  startGameBtn.addEventListener('click', startRoomGame); //= > activate board, send messages
  return startGameBtn;
};
const initPlayAgstComBtn = () => {
  const playAgstComBtn = document.createElement('button');
  playAgstComBtn.classList.add('btn', 'btn-light', 'm-1');
  playAgstComBtn.innerText = 'Play against computer';

  playAgstComBtn.addEventListener('click', () => {
    comOptionsModal();
    const optionM = new Modal(document.getElementById('optionsModal'));
    optionM.toggle();
  });
  return playAgstComBtn;
};

const initFindMatchBtn = () => {
  const findMatchBtn = document.createElement('button');
  findMatchBtn.classList.add('btn', 'btn-info', 'm-1');
  findMatchBtn.innerText = 'Fight otters';
  findMatchBtn.addEventListener('click', () => {
    usersModal();
    const userM = new Modal(document.getElementById('usersModal'));
    userM.toggle();
  });
  return findMatchBtn;
};

const initLocalMultiplayerBtn = () => {
  const playLocalBtn = document.createElement('button');

  playLocalBtn.classList.add('btn', 'btn-light', 'm-1');
  playLocalBtn.innerText = 'Play locally';

  playLocalBtn.addEventListener('click', initLocalGame);
  return playLocalBtn;
};
const mainPage = () => {
  // fill header
  // render tip board/reversi puzzle (level? random warm up board? board of the great)
  // against ai, local multiplayer, find match btn
  actionContainer.innerHTML = '';

  actionContainer.appendChild(initLocalMultiplayerBtn());
  actionContainer.appendChild(initPlayAgstComBtn());
  // -> lead to page with all users where player can pick their opponent
  actionContainer.appendChild(initFindMatchBtn());
};

const submitSignUpForm = () => {
  console.log('hey in signup');
  const username = document.querySelector('#ottername').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const errorContainer = document.querySelector('#error-msg');

  if (email === '' || password === '' || username === '') {
    errorContainer.innerHTML = 'Please fill in all the fields';

    errorContainer.classList.remove('d-none');
    return;
  }

  axios
    .post('/signup', { username, email, password })
    .then((response) => {
      if (response.data.error) {
        throw response.data.error;
      }
      userId = response.data.userId;
    })
    .then(() => {
      removeModal();
      mainPage();
    })
    .catch((error) => {
      errorContainer.innerText = 'Email already in use';
      errorContainer.classList.remove('d-none');
      console.log(error);
    });
};
const submitLoginForm = () => {
  console.log('hey');
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;
  const errorContainer = document.querySelector('#error-msg-login');

  if (email === '' || password === '') {
    errorContainer.innerHTML = 'Please fill in all the fields';
    errorContainer.classList.remove('d-none');
    return;
  }

  axios
    .post('/login', { email, password })
    .then((response) => {
      if (response.data.error) {
        throw response.data.error;
      }
      userId = response.data.userId;
    })
    .then(() => {
      removeModal();
      mainPage();
    })
    .catch((error) => {
      errorContainer.innerHTML = 'Wrong email or password';
      errorContainer.classList.remove('d-none');
      console.log(error);
    });
};
const loginModal = () => {
  const loginHTML = `<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="loginModalLabel">Log In</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
       <div id="error-msg-login" class="alert alert-danger d-none" role="alert">
        </div>
        <div>
          <div class="mb-3">
            <label for="login-email" class="col-form-label">Email:</label>
            <input type="email" class="form-control" id="login-email">
          </div>
          <div class="mb-3">
            <label for="login-password" class="col-form-label">Password:</label>
            <input type="password" class="form-control" id="login-password">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
        <button type="button" id="innerLoginBtn" class="btn btn-info">Log In</button>
      </div>
    </div>
  </div>
</div>`;

  modalContainer.innerHTML = loginHTML;
  const innerLoginBtn = document.getElementById('innerLoginBtn');

  innerLoginBtn.addEventListener('click', submitLoginForm);
};

const signUpModal = () => {
  const signupHTML = `<div class="modal fade" id="signupModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="loginModalLabel">Sign Up</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div id="error-msg" class="alert alert-danger d-none" role="alert">
        </div>
        <div>
          <div class="mb-3">
            <label for="ottername" class="col-form-label">Ottername:</label>
            <input type="text" class="form-control" id="ottername">
          </div>
          <div class="mb-3">
            <label for="email" class="col-form-label">Email:</label>
            <input type="email" class="form-control" id="email">
          </div>
          <div class="mb-3">
            <label for="password" class="col-form-label">Password:</label>
            <input type="password" class="form-control" id="password">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
        <button type="button" id="innerSignUpBtn" class="btn btn-info">Sign up</button>
      </div>
    </div>
  </div>
</div>`;

  modalContainer.innerHTML = signupHTML;
  const innerSignUpBtn = document.getElementById('innerSignUpBtn');

  innerSignUpBtn.addEventListener('click', submitSignUpForm);
};

const startPage = () => {
  socket.emit('startpage', 'starting');
  headerContainer.innerText = 'RiverSea';
  gameType = 'local';
  initGame(gameType);

  modalContainer.innerHTML = '';
  const loginBtn = document.createElement('button');
  loginBtn.classList.add('btn', 'btn-info', 'm-1');
  loginBtn.innerText = 'Login';

  const signupBtn = document.createElement('button');
  signupBtn.classList.add('btn', 'btn-light', 'm-1');
  signupBtn.innerText = 'Sign up';

  actionContainer.appendChild(signupBtn);

  actionContainer.appendChild(loginBtn);

  loginBtn.addEventListener('click', () => {
    loginModal();

    const loginM = new Modal(document.getElementById('loginModal'));
    loginM.toggle();
  });

  signupBtn.addEventListener('click', () => {
    signUpModal();

    const signupM = new Modal(document.getElementById('signupModal'));
    signupM.toggle();
  });
};

const map = () => {
  // plan attack
};
startPage();
