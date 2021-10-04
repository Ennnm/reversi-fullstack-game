import axios from 'axios';
// import { createPopper } from '@popperjs/core';
import { Modal } from 'bootstrap';
import './styles.scss';

// checkLoggedIn();
const headerContainer = document.querySelector('#header-container');
const gameContainer = document.querySelector('#game-container');
const infoContainer = document.querySelector('#info-container');
const statusContainer = document.querySelector('#status-container');
const actionContainer = document.querySelector('#action-container');
const modalContainer = document.querySelector('#modal-container');

gameContainer.classList.add('relative');
// game data
let playerIsBlack;
let isBlackTurn = true;
let gameId;
let turnNum;
let opponentId;
let coordValidMoves;
let gameType;
const boardSize = 8;

const renderScoreInfo = (numBlackSeeds, numWhiteSeeds) => {
  infoContainer.innerText = `Black: ${numBlackSeeds}  White: ${numWhiteSeeds}`;
};
const renderGameStatusInfo = (gameStatus, numBlackSeeds, numWhiteSeeds) => {
  if (gameStatus === 'Game has ended')
  {
    let endgameMesg = 'Its a tie';
    if (numBlackSeeds > numWhiteSeeds) {
      endgameMesg = 'Black wins!'; }
    else if (numBlackSeeds < numWhiteSeeds) {
      endgameMesg = 'White wins!'; }
    statusContainer.innerText = endgameMesg;
  }

  else {
    statusContainer.innerText = gameStatus;
  }
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
const removeElemById = (id, container) => {
  const element = document.querySelector(`#${id}`);
  if (element !== null) {
    container.removeChild(element);
  }
};
const renderBoard = (boardData) => {
  // re-renders board
  removeElemById('boardGrid', gameContainer);
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
const renderMoveGrid = (e) => {
  if (e.key !== ' ') {
    return;
  }
  removeElemById('moveGrid', gameContainer);
  gameContainer.appendChild(initMovesGrid());

  coordValidMoves.forEach((coord) => {
    const [i, j] = coord;
    const moveCell = document.querySelector(`#move_${i}_${j}`);
    if (isBlackTurn === true)
    {
      moveCell.classList.add('highlight-cell-black');
    }
    else if (isBlackTurn === false) {
      moveCell.classList.add('highlight-cell-white');
    }
  });
};

document.addEventListener('keydown', renderMoveGrid);
document.addEventListener('keyup', (e) => {
  if (e.keyCode !== 32) {
    return;
  }
  removeElemById('moveGrid', gameContainer); });

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
  const difficultyLvl = document.querySelector('#difficultyRange').value;
  console.log('difficultyLvl :>> ', difficultyLvl);

  axios.put(`/game/${gameId}/${turnNum}/computermove`, { isBlackTurn, difficultyLvl })
    .then((response) => {
      turnNum = response.data.turnNum;
      isBlackTurn = response.data.isBlackTurn;
      // change of turn
      // get computer to play
      const { gameState, validMoves } = response.data;
      removeElemById('moveGrid', gameContainer);

      renderGameState(gameState);
      coordValidMoves = validMoves.map((move) => move.coord);
    }).catch((err) => console.log('error in computer making a move '));
};
const clickOnCell = (e) => {
  const cell = e.target;
  const cellId = cell.id;
  const [rowIndex, colIndex] = cellId.split('_').slice(1).map((x) => parseInt(x, 10));

  const seedCell = document.querySelector(`#square_${rowIndex}_${colIndex}`);

  if (seedCell.innerHTML !== '') {
    return;
  }
  // send
  axios.put(`/game/${gameId}/${turnNum}/move`, { isBlackTurn, colIndex, rowIndex })
    .then((response) => {
      console.log('response.data in clickonCell:>> ', response.data);
      if (response.data.isValidMove === false)
      {
        return;
      }
      turnNum = response.data.turnNum;
      isBlackTurn = response.data.isBlackTurn;
      // change of turn
      // get computer to play
      const { gameState, validMoves } = response.data;
      removeElemById('moveGrid', gameContainer);

      renderGameState(gameState);
      coordValidMoves = validMoves.map((move) => move.coord);

      if (gameType === 'computer') {
        console.log('going into computer move');
        // not possible to route axios to axios, should get computer player to make move from server side
        computerMove();
      }
    }).catch((err) => console.log('error in clickOnCell:>> ', err));
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
  // initiator is black
  playerIsBlack = true;
  axios.post('/games', {
    gameType, opponentId, playerIsBlack,
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

const intiComGame = () => {
  gameType = 'computer';
  console.log('in p vp computer');

  // in computer player, all created moves by black will receive a reaction move from com
  // gameContainer.appendChild(initBoardElem());
  removeModal();
  initGame(gameType);
  // need to await initGame  or put the different status msg in init game
  statusContainer.innerText = 'Starting game against computer. You/Black starts first';
  actionContainer.innerHTML = '';
  // init game
  // game board
  // fill info-container (who moves)
  // fill container (black seeds, white seeds)
  // expandable: previous moves, changes in seed numbers -> extract most impactful move
  // undo btn -> undo > 3 times: labelled as save scum, save boards of shame
  // surrender btn -> end game
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

  innerStartBtn.addEventListener('click', intiComGame);
};

const mainPage = () => {
  // fill header
  // render tip board/reversi puzzle (level? random warm up board? board of the great)
  // against ai, local multiplayer, find match btn
  actionContainer.innerHTML = '';

  const playAgstComBtn = document.createElement('button');
  playAgstComBtn.classList.add('btn', 'btn-light');
  playAgstComBtn.innerText = 'Play against computer';

  playAgstComBtn.addEventListener('click', () => {
    comOptionsModal();
    const optionM = new Modal(document.getElementById('optionsModal'));
    optionM.toggle();
  });

  const findMatchBtn = document.createElement('button');
  findMatchBtn.classList.add('btn', 'btn-info');
  findMatchBtn.innerText = 'Fight otters';

  actionContainer.appendChild(playAgstComBtn);
  // -> lead to page with all users where player can pick their opponent
  actionContainer.appendChild(findMatchBtn);
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

  axios.post('/signup', { username, email, password })
    .then((response) => {
      if (response.data.error)
      {
        throw response.data.error;
      }
    }).then(() => {
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

  axios.post('/login', { email, password })
    .then((response) => {
      if (response.data.error)
      {
        throw response.data.error;
      }
    }).then(() => {
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
  headerContainer.innerText = 'RiverSea';
  gameType = 'local';
  initGame(gameType);

  modalContainer.innerHTML = '';
  const loginBtn = document.createElement('button');
  loginBtn.classList.add('btn', 'btn-info');
  loginBtn.innerText = 'Login';

  const signupBtn = document.createElement('button');
  signupBtn.classList.add('btn', 'btn-light');
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
startPage();
// loginModal();
// multiplayerLocalGame();
