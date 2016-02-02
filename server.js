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

var gameCode = '';
var players = [];

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

    function getBlackCard() {
        cardText = 'The answer to this question is _';
        numBlanks = (cardText.match(/_/g) || []).length;
        return {
            text: cardText,
            blanks: numBlanks
        };
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
            socket.emit('login error', {
                error: 'invalid room code ' + data.roomCode
            });
            return;
        } else if (players.indexOf(data.username) > -1) {
            socket.emit('login error', {
                error: 'name ' + data.username + ' already taken'
            });
            return;
        }
        socket.username = data.username;
        addedUser = true;
        players.push(data.username);
        console.log(data.username + ' joined room ' + roomCode);
        socket.emit('login success');
        socket.broadcast.emit('user joined', {
            players: players
        });
    });

    // The host has started the game
    socket.on('start game', function () {
        console.log('Game is starting!');
        blackCard = getBlackCard();
        socket.emit('black card', {
            text: blackCard.text
        });
        socket.broadcast.emit('new round', {
            blanks: blackCard.blanks
        });
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
            username: socket.username,
            cardText: data.cardText,
            done: data.done
        });
    });

    // The client was kicked from the room
    socket.on('user kicked', function () {
        if (addedUser) {
            addedUser = false;
            index = players.indexOf(socket.username);
            if (index > -1) players.splice(index, 1);
        }
    });

    // The client or game host has disconnected
    socket.on('disconnect', function () {
        if (addedUser) {
            index = players.indexOf(socket.username);
            if (index > -1) players.splice(index, 1);
            console.log(socket.username + ' left room ' + socket.roomCode);
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                players: players
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

