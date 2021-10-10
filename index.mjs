import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import http from 'http';
import { Server } from 'socket.io';
import bindRoutes from './routes.mjs';
// Initialise Express instance
const app = express();

const server = http.createServer(app);
const io = new Server(server);
// Set the Express view engine to expect EJS templates
app.set('view engine', 'ejs');
// Bind cookie parser middleware to parse cookies in requests
app.use(cookieParser());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());
// Bind method override middleware to parse PUT and DELETE requests sent as POST requests
app.use(methodOverride('_method'));
// Expose the files stored in the public folder
app.use(express.static('public'));
// Expose the files stored in the distribution folder
app.use(express.static('dist'));
// Bind route definitions to the Express application
bindRoutes(app);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => { console.log('user disconnected'); });
  socket.on('online-game', (msg) => {
    console.log(`room: ${msg.gameId} ${msg.whiteId}`);
  });
  socket.on('startpage', (msg) => {
    io.emit('startpage', msg);
    console.log('server can receive');
  });
  socket.on('online-game', (msg) => {
    io.emit('online-game', msg);
  });
  socket.on('reload-board', (msg) => {
    console.log('reload-board msg :>> ', msg);
    io.emit('reload-board', msg);
  });
});

// Set Express to listen on the given port
const PORT = process.env.PORT || 3004;
// app.listen(PORT);
server.listen(PORT, () => {
  console.log(`listening on** :${PORT}`);
});
