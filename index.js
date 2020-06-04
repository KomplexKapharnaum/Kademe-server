// kademe-server

var activePhase = 'intro'
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
app.use('/media', express.static(path.join(__dirname, 'www/media')))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/www/index.html');
});

io.on('connection', function(client)
{
  console.log('a user connected');

  // Once client introduce himself
  client.on('iam', (name)=>{

    // Setup client to correct phase
    client.emit('cmd', {'action': 'phase', 'arg': activePhase})
    client.emit('newcli', book)

    // Notify others
    client['name'] = name
    book.push(client)
    io.emit('newcli', [name])

    console.log('cli introduced as', name)
  })
  
  // Client exit: remove from book and inform others
  client.on('disconnect', function(){
    console.log('user disconnected');
    let i = book.indexOf(client)
    if (i >= 0) 
    {
      io.emit('gonecli', client['name'])
      book.splice(i, 1);
    }
  });

  // Relay cmd from Kontroler to all clients
  client.on('cmd', (data)=>{
    console.log('relay cmd', data);
    if (data.action == 'phase') activePhase = data.arg // save activePhase
    io.emit('cmd', data)
  })

});

http.listen(8080, function(){
  console.log('listening on *:8080');
});