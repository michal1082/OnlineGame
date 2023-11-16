const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (userData) => {
    users[socket.id] = userData;
    io.to(socket.id).emit('existingUsers', users);
    io.emit('newUser', { id: socket.id, userData });
  });

  socket.on('chatMessage', (message) => {
    const user = users[socket.id];
    if (user) {
      io.emit('chatMessage', { id: socket.id, message });
    }
  });

  socket.on('move', (position) => {
    if (users[socket.id]) { // Check if the user exists in the 'users' object
      users[socket.id].position = position;
      io.emit('playerMove', { id: socket.id, position });
    }
  });

  socket.on('disconnect', () => {
    const disconnectedUser = users[socket.id];
    delete users[socket.id];
    io.emit('userDisconnect', { id: socket.id });

    if (disconnectedUser) {
      console.log(`User ${disconnectedUser.username} disconnected`);
    } else {
      console.log('A user disconnected');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
