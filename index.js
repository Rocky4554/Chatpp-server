const http = require('http');
const express = require('express');
const {Server} = require('socket.io');
const cors = require('cors');

const port=process.env.PORT || 5000;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
const { callbackify } = require('util');

const app = express();
const server = http.createServer(app);
const io = new Server(server ,{
  cors:{
    origin : "http://localhost:3000",
    methods : ["GET","POST"],
  },
});

app.use(cors());
app.use(router);

// io.on('connection', (socket) => {
//   socket.on('join', ({ name, room }, callback) => {
//     const { error, user } = addUser({ id: socket.id, name, room });

//     if(error) return callback(error);

//     socket.join(user.room);
//     // admin generated message is shown as message
//     socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});//giving us a message that user has joined the chat
//     socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });//giving us a message that that user has to everybody else expect that user

//     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

//     callback();
//   });

  // socket.on('sendMessage', (message, callback) => { //  events user generated message 
  //   const user = getUser(socket.id);

  //   io.to(user.room).emit('message', { user: user.name, text: message });// specifying room name

  //   callback();
//   });

  // socket.on('disconnect', () => {
  //   const user = removeUser(socket.id);

  //   if(user) {      
  //     io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
  //     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
  //   }
  // })
// });

io.on('connection',(socket) => {

socket.on('join',({name,room}, callback) =>{
  const {error,user } = addUser({id: socket.id , name,room});

  if(error) return callback(error);

  socket.emit('message',{user: 'admin',text:`${user.name},welcome to the room`});
  socket.broadcast.to(user.room).emit('message',{user: 'admin',text:`${user.name},has joined !`});

  socket.join(user.room);

  io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

  callback();

});

  // socket.on('sendMessage', (message,callback) =>{
  //   const user = getUser(socket.id);

  //   io.to(user.room).emit('message', { user: user.name, text: message });

  //   callback();
    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id);
  
      io.to(user.room).emit('message', { user: user.name, text: message });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
  
      callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {      
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })

});


server.listen(port, () => console.log(`Server has started on ${port}.`));