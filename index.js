// kademe-server

var activePhase = 0

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
  socket.emit('phase', activePhase)

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  // relay cmd from Kontroler to all clients
  socket.on('cmd', (data)=>{
    console.log('cmd', data);
    if (data.action == 'phase') activePhase = data.args // save activePhase
    io.emit(data.action, data.args)
  })

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});