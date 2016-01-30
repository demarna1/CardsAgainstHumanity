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

    // The host wants to create a new game lobby
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
        roomCode = data.roomCode.toUpperCase();
        if (roomCode !== gameCode) {
            socket.emit('invalid code', {
                roomCode: roomCode
            });
            return;
        }
        socket.username = data.username;
        socket.roomCode = roomCode;
        ++numUsers;
        addedUser = true;
        console.log(data.username + ' joined room ' + roomCode);
        console.log('numUsers = ' + numUsers);
        socket.emit('login success', {
            username: data.username
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // The host has started the game
    socket.on('start game', function () {
        console.log('Game is starting!');
        socket.emit('black card', {
            blackCard: 'Sample black card'
        });
        socket.broadcast.emit('new round');
    });

    // The client has requested some cards
    socket.on('card request', function (data) {
        console.log('user requests ' + data.numCards + ' cards');
        whiteCards = [];
        for (i = 0; i < data.numCards; i++) {
            whiteCards.push('This is card ' + i);
        }
        socket.emit('white cards', {
            whiteCards: whiteCards
        });
    });

    // The client has submitted an answer card
    socket.on('answer card', function (data) {
        console.log('received answer from ' + data.username);
        socket.broadcast.emit('user answered', {
            username: data.username,
            cardText: data.cardText
        });
    });

    // The client was kicked from the room
    socket.on('user kicked', function () {
        if (addedUser) {
            addedUser = false;
            --numUsers;
        }
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

