var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/play'));
app.use(express.static(__dirname + '/game'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/play', function(req, res) {
    res.sendFile(__dirname + '/play/play.html');
});
app.get('/game', function(req, res) {
    res.sendFile(__dirname + '/game/game.html');
});

server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

var numUsers = 0;
var gameCode = "HOUS";

io.on('connection', function (socket) {
    var addedUser = false;

    function invalidCode(roomCode) {
        console.log('Invalid room code: ' + roomCode);
        if (addedUser) {
            addedUser = false;
            numUsers--;
        }
        socket.emit('invalid code', {
            roomCode: roomCode
        });
    }

    // The client is logging into a room
    socket.on('login', function (data) {
        if (data.roomCode !== gameCode) {
            invalidCode(data.roomCode);
            return;
        }
        if (addedUser) return;
        socket.username = data.username;
        ++numUsers;
        addedUser = true;
        console.log(data.username + ' joined room ' + data.roomCode +
            '; numUsers = ' + numUsers);
        socket.emit('login success', {
            username: data.username
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
});

