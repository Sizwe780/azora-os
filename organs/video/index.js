/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', socket => {
  socket.on('join', room => {
    socket.join(room);
    socket.to(room).emit('peer-joined');
  });
  socket.on('signal', ({ room, data }) => {
    socket.to(room).emit('signal', data);
  });
});

server.listen(4400, () => console.log("[video] signaling running on 4400"));
