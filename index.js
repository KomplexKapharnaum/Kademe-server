// kademe-server

var lastCmd =  {'action': 'phase', 'arg': 'intro', 'from': 'Bonnard'}
var book = []

var path = require('path')
var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http); 

app.use('/js', express.static(path.join(__dirname, 'www/js')))
app.use('/font', express.static(path.join(__dirname, 'www/font')))
app.use('/css', express.static(path.join(__dirname, 'www/css')))
app.use('/res', express.static(path.join(__dirname, 'www/res')))
app.use('/img', express.static(path.join(__dirname, 'www/img')))
app.use('/lib', express.static(path.join(__dirname, 'www/lib')))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/www/index.html');
});

io.on('connection', function(client)
{
  console.log('a user connected');

  // Once client introduce himself
  client.on('iam', (name)=>{

    // Setup client to correct phase
    client.emit('cmd', lastCmd)
    client.emit('allNames', book)

    // Notify others
    client['name'] = name
    book.push(name)
    io.emit('newName', name)

    console.log('cli introduced as', name)
    console.log('number of cli: ', book.length)
    console.log('cli list: ', book) 
  })
  
  // Client exit: remove from book and inform others
  client.on('disconnect', function(){
    console.log('user disconnected');
    io.emit('goneName', client['name'])
    var index = book.indexOf(client['name']);
    if (index > -1) book.splice(index, 1);
  });

  // Relay cmd from Kontroler to all clients
  client.on('cmd', (data)=>{
    console.log('relay cmd', data);
    if (data.action == 'phase') lastCmd = data // save activePhase
    io.emit('cmd', data)
  })

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});