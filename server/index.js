const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Setup Express server and Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve the index.html file explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

let rooms = {}; // Object to track rooms and players

// Socket.IO connection and room management
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle room creation requests
  socket.on('createRoom', () => {
    const roomId = uuidv4(); // Generate unique Room ID
    rooms[roomId] = { players: {} };
    socket.join(roomId); // Join the new room
    socket.emit('roomJoined', roomId); // Send Room ID to the client
    console.log(`Room created: ${roomId}`);
  });

  // Handle room join requests
  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId]) {
      if (Object.keys(rooms[roomId].players).length < 10) {
        socket.join(roomId);
        rooms[roomId].players[socket.id] = { x: 400, y: 300 };

        // Send updated player list to all clients in the room
        io.to(roomId).emit('currentPlayers', rooms[roomId].players);
        io.to(roomId).emit('updatePlayerCount', Object.keys(rooms[roomId].players).length);

        socket.emit('roomJoined', roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
      } else {
        socket.emit('playerLimitReached');
        console.log(`Room ${roomId} is full. User ${socket.id} cannot join.`);
      }
    } else {
      socket.emit('roomNotFound', roomId);
      console.log(`Room not found: ${roomId}`);
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit('currentPlayers', rooms[roomId].players);
        io.to(roomId).emit('updatePlayerCount', Object.keys(rooms[roomId].players).length);
        console.log(`User ${socket.id} left room: ${roomId}`);
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
