# Post-Mortem Meeting (RiverSea full-stack game)

### Technical Review

###### "Technical" refers to software logic and syntax.

##### What went well? Please share a link to the specific code.

- [game logic](game logic 
  https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/src/game-logic.mjs[) 

- basic dom buttons, click-grid, seed-grid, flipped grid, move grid modularized into [functions](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/src/index.js).

  Tried to refactor them into another file aside from index.js but its too interconnected with other functions that it breaks

- getting [create game and createMove functions](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/controllers/games.mjs#L47) in controller to apply to local multiplayer, computer, and online game 

- 

##### What were the biggest challenges you faced? Please share a link to the specific code.

- trying to refactor createMove and computerMove in the game controller. They are extra long [line 195 and 283, line 285-374](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/controllers/games.mjs#L195) and are still that long. My controller code tend to be long. Wonder how better to write them, they seem too complicated
  
  ###### Much of the code for sockets can be placed on the server/controller
  
- making nested nested WHERE statements for sequelize queries that returned a flat data structure instead of a triple nested object that I expected.
  Had to resort to using a filter to get what I want. Sequelize is still quite cryptic, wanted to do a [nested eager load](https://sequelize.org/master/manual/eager-loading.html#complex-where-clauses-at-the-top-level), but a triple level nested one.

  ######  [line 152-153](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/controllers/games.mjs#L152). Nested eager load OK! HAVE TO MAKE WHERE QUERIES PROPERLY and reference the object instead of looking for the branch structure in the console log

- Using associations defined in model>index.js. Ultimately only used [one](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/controllers/games.mjs#L159) . Not sure if it could be used like this `db.Game.blackPlayer`

- Getting multiplayer game to work with sockets. Most of the tutorials were chat rooms. As I needed to finish it in a  day, sockets were implemented really simply.
  [server-side listening and re-emits](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/index.mjs#L29)

  [client-side listening](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/index.mjs#L29)
  [client-side emits](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/index.mjs#L29)

  Saw that socket.io had the concept of [rooms](https://socket.io/docs/v4/rooms/). Thought it should have been applicable for the use in game rooms but didn't know how to implement it. Have some fear that with the current implementation, it would only work for one multiplayer room for the whole site.

- Also had concern of storing a lot of the game data on the [client-side](https://github.com/Ennnm/reversi-fullstack-game/blob/8f611ebf824fd00a5a51d02f80889120e81707c8/src/index.js#L32). These variables will be unique to this instance of the browser opening the site? Will these variables be affected as more users access the site?
  When do we opt to store this information as cookies vs variables in index.js
  
- Attempted to use async-await with axios which required 'regenerator-runtime/runtime'
  Not sure the usual set up with axios, it is async but does not require its parent function to be async-await .
  Finally placed two axios.get in the same function [onlineUsersContainer](https://github.com/Ennnm/reversi-fullstack-game/blob/online-pvp/src/index.js#L635) and felt like doing this was breaking some convention. I don't know

##### What would you do differently next time?

- sockets was easier to implement than expected, should have tried implementing it earlier for better execution. Have more questions than answers wrt its use.
- Could have implemented a more difficult game (go) though it would have led to less time trying out a computer/ online multiplayer modes, would have been more motivated to work on project 3 mid-way.
- use npm run watch earlier, was using npm run build for a week

### Process Review

###### "Process" refers to app development steps and strategy.

##### What went well?

- end app contained most of what I wanted to test out. Partly possible as the app had almost 0 layout/css to configure. The most I had to do was get the modals to work.
- Unlike my peers. I started out with webpack + sequelize database which makes me slow on the game-logic implementation. 
  Was good because I did not have to transfer/ migrate the logic from client to back-end. 
  Part of the reason why I started backend first was because I'm less confident with these systems compared to coming up with game logic.

##### What could have been better?

- Initially had wilder ideas for a game which involved 3d assets ( modern art card game x located in a real-life-gallery). Had to tone down the idea a lot after evaluating what's possible and familiarity with sequelize, webpack.
- Finally I came up with a riverSea x otters idea. Didn't have the energy to pull through most of the theming that wasn't a big issue, the database was also planned for the history of moves to be shown on the client side, which was ultimately un-used.
  Perhaps the app had been overplanned as the development could not match with planning.
- Think this project could be framed better, its not very interesting to implement a project that feels like a project 1 app. 
  If the use of the database was better promoted such that its used to show interesting results/ Sequelize-is-amazing, would have been more encouraged to practice sequelize at a higher level. Have a feeling that a lot of my peers are bored with sequelize/webpack as they tend to leave it for later or use firebase.
- At some point, I thought doing dsna or reading com sci books were better use of time, though I  realised the benefits of book-learning can be quite limited.

##### What would you do differently next time?

- Implement go/ try out multiplayer earlier. Very dependent on how much energy + motivation I have at the start of the project