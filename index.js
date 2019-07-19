// bcb-server

// var app = require('express')();
// var http = require('http').createServer(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/www/index.html');
// });

// io.on('connection', function(socket){
//   console.log('a user connected');
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });


// var http = require('http');

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello World\n');
// }).listen(8080, 'localhost');

// console.log('Server running at http://localhost:8080/');

var path = require('path')
var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http); 


app.use('/js', express.static(path.join(__dirname, 'www/js')))
app.use('/font', express.static(path.join(__dirname, 'www/font')))
app.use('/css', express.static(path.join(__dirname, 'www/css')))
app.use('/res', express.static(path.join(__dirname, 'www/res')))
app.use('/media', express.static(path.join(__dirname, 'www/media')))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/www/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('mqtt', function(data){
    console.log('mqtt', data);
    io.emit('mqtt', data)
  });

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});