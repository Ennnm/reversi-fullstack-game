import axios from 'axios';
import './styles.scss';

// Make a request for all the items
// put axios function, run function according to userflow diagram

// axios.get('/items')
//   .then((response) => {
//     // handle success
//     console.log(response.data.items);

//     const itemCont = document.createElement('div');

//     response.data.items.forEach((item) => {
//       const itemEl = document.createElement('div');
//       itemEl.innerText = JSON.stringify(item);
//       itemEl.classList.add('item');
//       document.body.appendChild(itemEl);
//     });

//     document.body.appendChild(itemCont);
//   })
//   .catch((error) => {
//     // handle error
//     console.log(error);
//   });

// const checkLoggedIn = () => {
//   axios.get('/isloggedin')
//     .then((response) => {
//       console.log('response from login :>> ', response);
//       if (response.data.isLoggedIn === true)
//       {
//         document.body.appendChild(createGameBtn);
//       }
//       else {
//         // render other buttons
//         document.body.appendChild(loginBtn);
//         document.body.appendChild(registrationBtn);
//       }
//     })
//     .catch((error) => console.log('error from logging in', error));
// };
// // manipulate DOM, set up create game button
// const regisLoginForm = function (buttonName) {
//   const formContainer = document.querySelector('#form-container');

//   formContainer.innerHTML = `<input placeholder="email" id="email">
//   <input placeholder="password" id="password">
//   <button id=${buttonName}>${buttonName}</button>`;
// };

// const submitRegisForm = async () => {
//   const email = document.querySelector('#email').value;
//   const password = document.querySelector('#password').value;
//   const errorContainer = document.querySelector('#error-container');

//   await axios.post('/register', { email, password })
//     .then((response) => {
//       if (response.data.error)
//       {
//         throw response.data.error;
//       }
//       const formContainer = document.querySelector('#form-container');
//       formContainer.innerHTML = '';
//       errorContainer.innerHTML = '';
//     })
//     .catch((error) => {
//       errorContainer.innerHTML = '<p style="color:red">Email is not valid</p>';
//       console.log(error);
//     });
//   checkLoggedIn();
// };
// const submitLoginForm = async () => {
//   const email = document.querySelector('#email').value;
//   const password = document.querySelector('#password').value;
//   const errorContainer = document.querySelector('#error-container');

//   await axios.post('/login', { email, password })
//     .then((response) => {
//       if (response.data.error)
//       {
//         throw response.data.error;
//       }
//       const formContainer = document.querySelector('#form-container');
//       formContainer.innerHTML = '';
//       errorContainer.innerHTML = '';
//     })
//     .catch((error) => {
//       errorContainer.innerHTML = '<p style="color:red">Wrong email or password</p>';
//       console.log(error);
//     });
//   checkLoggedIn();
// };

// const regisForm = () => {
//   const formType = 'Register';
//   regisLoginForm(formType);
//   const submitButton = document.querySelector(`button[id=${formType}]`);
//   submitButton.addEventListener('click', submitRegisForm);
//   document.body.removeChild(loginBtn);
//   document.body.removeChild(registrationBtn);
// };

// const loginForm = () => {
//   const formType = 'Login';
//   regisLoginForm(formType);
//   const submitButton = document.querySelector(`button[id=${formType}]`);
//   submitButton.addEventListener('click', submitLoginForm);
//   document.body.removeChild(loginBtn);
//   document.body.removeChild(registrationBtn);
// };

// registrationBtn.addEventListener('click', regisForm);
// registrationBtn.innerText = 'Register';

// loginBtn.addEventListener('click', loginForm);
// loginBtn.innerText = 'Login';

// createGameBtn.addEventListener('click', createGame);
// createGameBtn.innerText = 'Start Game';

// checkLoggedIn();
const headerContainer = document.querySelector('#header-container');
const gameContainer = document.querySelector('#game-container');
const infoContainer = document.querySelector('#info-container');
const actionContainer = document.querySelector('#action-container');
const modalContainer = document.querySelector('#modal');

gameContainer.classList.add('relative');
// game data
let isBlackTurn = true;
let gameId;
let turnNum;
let opponentId;
const boardSize = 8;

const renderScoreInfo = (numBlackSeeds, numWhiteSeeds) => {
  infoContainer.innerText = `Black: ${numBlackSeeds}  White: ${numWhiteSeeds}`;
};

const addToCell = (isBlackSeed, rowIndex, colIndex) => {
  const cell = document.querySelector(`#square_${rowIndex}_${colIndex}`);
  // true is black seed, false is white seed, null is no seed
  const seed = isBlackSeed ? '<div class="seed" onclick="event.cancelBubble=true;"></div>'
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
      // follow convention A1... where A is column, 1 is row
      boardCell.id = `square_${i}_${j}`;
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
      // follow convention A1... where A is column, 1 is row
      boardCell.id = `move_${i}_${j}`;
    }
  }
  return table;
};
const removeBoardElem = () => {
  const existingBoardElem = document.querySelector('#boardGrid');
  if (existingBoardElem !== null) {
    gameContainer.removeChild(existingBoardElem);
  }
  const existingMoveElem = document.querySelector('#moveGrid');
  if (existingMoveElem !== null) {
    gameContainer.removeChild(existingMoveElem);
  }
};
const removeElemById = (id, container) => {
  const element = document.querySelector(`#${id}`);
  if (element !== null) {
    container.removeChild(element);
  }
};
const renderBoard = (boardData) => {
  // re-renders board
  removeElemById('boardGrid', gameContainer);
  // removeBoardElem();
  // gameContainer.appendChild(initMovesGrid());
  gameContainer.appendChild(initBoardElem());
  console.log('boardData :>> ', boardData);
  // run through board data, fill board
  for (let i = 0; i < boardData.length; i += 1)
  {
    const refRow = boardData[i];
    for (let j = 0; j < refRow.length; j += 1) {
      const refCell = refRow[j];
      if (refCell !== null) {
        addToCell(refCell, i, j);
      }
    }
  }
};
const renderMoveGrid = (movesData) => {
  removeElemById('moveGrid', gameContainer);
  gameContainer.appendChild(initMovesGrid());
  movesData.forEach((coord) => {
    const [i, j] = coord;
    const moveCell = document.querySelector(`#move_${i}_${j}`);
    moveCell.classList.add('highlight-cell');
  });
};
const renderGameState = (gameState) => {
  const { boardData, numBlackSeeds, numWhiteSeeds } = gameState;
  console.log('boardData :>> ', boardData);
  renderBoard(boardData);
  renderScoreInfo(numBlackSeeds, numWhiteSeeds);
};

const clickOnCell = (e) => {
  const cell = e.target;
  const cellId = cell.id;
  // check if token exists in cell
  const [rowIndex, colIndex] = cellId.split('_').slice(1).map((x) => parseInt(x, 10));

  const seedCell = document.querySelector(`#square_${rowIndex}_${colIndex}`);

  if (seedCell.innerHTML !== '') {
    return;
  }
  // send
  axios.put(`/game/${gameId}/${turnNum}/move`, { isBlackTurn, colIndex, rowIndex })
    .then((response) => {
      // response return success , invalid move, whose turn next, turn num
      // isBlackTurn = !isBlackTurn;
      console.log('response.data in clickonCell:>> ', response.data);
      if (response.data.isValidMove === false)
      {
        return;
      }
      turnNum = response.data.turnNum;
      isBlackTurn = response.data.isBlackTurn;
      const { gameState, validMoves } = response.data;
      console.log('validMoves in clickOnCell :>> ', validMoves);
      renderGameState(gameState);
      // renderMoveGrid(emptySpaceArdOpponent);
      const coordValidMoves = validMoves.map((move) => move.coord);
      console.log('coordValidMoves in clickonCell :>> ', coordValidMoves);
      renderMoveGrid(coordValidMoves);
    }).catch((err) => console.log('error in clickOnCell:>> ', err));
  // render

  // locally store gameId and game_turn
  // from gameId get latest game_turn
  // get gameState's board Data

  // evaluate if valid move.
  // make copy of existing board
  // if valid check token's impact of existing board. flip seeds
  // check number of valid moves for opposing player
  // if number == 0, current player continues to move
  // update board if white, create new board if white and black cannot move, else create a new board for the next 'turn'
  // return board for render

  // check if move is valid
  // if valid add token
};

const initClickGrid = () => {
  const table = document.createElement('table');
  table.classList.add('click-grid');
  for (let i = 0; i < boardSize; i += 1) {
    const boardRow = table.insertRow();
    for (let j = 0; j < boardSize; j += 1) {
      const boardCell = boardRow.insertCell();
      // follow convention A1... where A is column, 1 is row
      boardCell.id = `click_${i}_${j}`;
      boardCell.addEventListener('click', clickOnCell);
    }
  }
  return table;
};

const initGame = (gameType, opponentId = 0) => {
  // booleanArray true: black, false: white, undefined/null: empty
  axios.post('/games', { gameType, opponentId })
    .then((response) => {
      const turnData = response.data.initTurn;
      const { validMoves } = response.data;
      // validMoves is a list of objects container coord, direction with coord
      const coordValidMoves = validMoves.map((move) => move.coord);
      const { gameState } = turnData;
      gameId = turnData.gameId;
      turnNum = turnData.turnNum;
      renderGameState(gameState);
      renderMoveGrid(coordValidMoves);

      gameContainer.appendChild(initClickGrid());
    }).catch((e) => console.log('error in initGame:>> ', e));
};

const startPage = () => {
  headerContainer.innerText = 'RiverSea';
  // fill header
  // render board
  // login signup btn
};

const loginModal = () => {
  // error msg (display: 'none')
  // username
  // password
};

const signUpModal = () => {
  // error msg (display:'none')
  // username
  // email
  // password
};

const mainPage = () => {
  // fill header
  // render tip board/reversi puzzle (level? random warm up board? board of the great)
  // against ai, local multiplayer, find match btn

};

const comOptionsModal = () => {
  // easy, medium, hard (1,2,3)
  // show moves toggle
  // save btn (update user_option table)
  // play btn (start computer vs player game)
};

const playerComGame = () => {
  // init game
  // game board
  // fill info-container (who moves)
  // fill container (black seeds, white seeds)
  // expandable: previous moves, changes in seed numbers -> extract most impactful move
  // undo btn -> undo > 3 times: labelled as save scum, save boards of shame
  // surrender btn -> end game
};

const endGame = () => {
  // background animation
  // info-container: 'Victory!" 'You have lost" "Save-scum"
  // most significant turn. animate change in seed poccession on board /game highlights
  // or corners taken
  // expandale. Other significant turns, click to show on board
  // main btn
};

const animateBetweenTurns = () => {
  // after black moves, after white moves
  // to show seed changes at significant turns
};

const findMatchModal = () => {
  // finding match .... ellipses
  // match found -> from logged in users
  // show user details ( username, wins, losses, rank?)
  // find another, play btn
};
const multiplayerLocalGame = () => {
  console.log('in multiplayer local');
  // gameContainer.appendChild(initBoardElem());
  initGame('local');

  // black player
  // white player
};
const multiplayerOnlineGame = () => {
  // connection by sockets?
};
const users = () => {
  // show online and offline players
  // rank, status
};
const map = () => {
  // plan attack
};
multiplayerLocalGame();
