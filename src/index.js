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

const startPage = () => {
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
