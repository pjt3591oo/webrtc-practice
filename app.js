const express = require('express');
const app = express();
const cors = require('cors');

app.set('view engine', 'ejs');
app.set('views', 'views')
app.use(express.static('public'));
app.use(cors());

app.get('/', (req, res, next) => {
  res.render('index', {});
})

const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(3000, function() {
  console.log('Socket IO server listening on port 3000');
});

const usersByRoom = {}

const rooms = {}

io.on('connection', socket => {
  console.log(socket.id);

  socket.on('join', data => {
    let { room } = data;
    console.log('join room: ', room)
    socket.join(room);
    usersByRoom[socket.id] = room;
    rooms[room] = rooms[room] || 0;
    rooms[room]++;
    io.sockets.to(socket.id).emit('all_user', rooms[room]);
  })

  socket.on('offer', sdp => {
    console.log('offer')
    socket.broadcast.emit('receive_offer', sdp);
  })

  socket.on('answer', sdp => {
    console.log('answer')
    socket.broadcast.emit('receive_answer', sdp);
  })

  socket.on('candidate', candidate => {
    if(candidate) socket.broadcast.emit('receive_candidate', candidate);
  })

  socket.on('disconnect', () => {
    let room = usersByRoom[socket.id];
    rooms[room]--;
    socket.broadcast.emit('leave');
  })
})