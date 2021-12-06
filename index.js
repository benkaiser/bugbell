const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/public', express.static('public'));

app.get('/*', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  socket.on('joinhost', (roomID) => {
    console.log('Joinging room: ' + roomID);
    socket.join(roomID);
  });

  socket.on('ringbell', (roomID) => {
    socket.to(roomID).emit('ringbell');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});