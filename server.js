var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/main'));
app.use(express.static(__dirname + '/play'));
app.use(express.static(__dirname + '/game'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/main/index.html');
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
var gameCode = '';

io.on('connection', function (socket) {
    var addedUser = false;
    var addedGame = false;
    console.log('new connection');

    function generateGameCode() {
        var text = '';
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i=0; i<4; i++) {
            text += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return text;
    }

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

    // The host wants to start a new game
    socket.on('new game', function () {
        if (gameCode) {
            socket.emit('host exists', {
                gameCode: gameCode
            });
            return;
        }
        addedGame = true;
        gameCode = generateGameCode();
        console.log('New game started with gameCode = ' + gameCode);
        socket.emit('code created', {
            gameCode: gameCode
        });
    });

    // The client is logging into a room
    socket.on('login', function (data) {
        if (data.roomCode !== gameCode) {
            invalidCode(data.roomCode);
            return;
        }
        if (addedUser) return;
        socket.username = data.username;
        socket.roomCode = data.roomCode;
        ++numUsers;
        addedUser = true;
        console.log(data.username + ' joined room ' + data.roomCode);
        console.log('numUsers = ' + numUsers);
        socket.emit('login success', {
            username: data.username
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // The client or game host has disconnected
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            console.log(socket.username + ' left room ' + socket.roomCode);
            console.log('numUsers = ' + numUsers);
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
        if (addedGame) {
            console.log('Game host with code = ' + gameCode + ' has disconnected');
            socket.broadcast.emit('host left', {
                gameCode: gameCode
            });
            gameCode = '';
            addedGame = false;
        }
    });
});

