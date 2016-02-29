var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ivonaNode = require('ivona-node');
var fs = require('fs');
var db = require('./db/db.js');
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
app.get('/game/currentq.mp3', function(req, res) {
    res.sendFile(__dirname + '/game/currentq.mp3');
});

server.listen(port, function() {
    console.log('Server listening on port %d', port);
});

var gameCode = '';
var players = [];
var lineReader = require('readline').createInterface({
    input: fs.createReadStream(__dirname + '/cred/ivona_cred.txt')
});
var accessKey = '';
var secretKey = '';
var lineNo = 0;
var ivona = null;
lineReader.on('line', function (line) {
    if (lineNo == 0) {
        accessKey = line.split('=')[1];
    } else if (lineNo == 1) {
        secretKey = line.split('=')[1];
        ivona = new ivonaNode({
            accessKey: accessKey,
            secretKey: secretKey
        });
    }
    ++lineNo;
});

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
        var roomCode = data.roomCode.toUpperCase();
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
        db.blackCard(function (err, blackCard) {
            if (err) return console.log(err);
            var audioFile = fs.createWriteStream(__dirname + '/game/currentq.mp3');
            var ttv = blackCard.text.replace(/_/g, 'blank');
            var appVoice = { body: { voice: {
                name: 'Brian',
                language: 'en-GB',
                gender: 'Male'
            }}};
            var stream = ivona.createVoice(ttv, appVoice).pipe(audioFile);
            stream.on('finish', function() {
                socket.emit('audio finished');
            });
            socket.emit('black card', {
                text: blackCard.text,
                pick: blackCard.pick
            });
            socket.broadcast.emit('new round', {
                pick: blackCard.pick
            });
        });
    });

    // The client has requested some cards
    socket.on('card request', function (data) {
        console.log('user requests ' + data.numCards + ' cards');
        db.whiteCards(data.numCards, function(err, whiteCards) {
            if (err) return console.log(err);
            socket.emit('white cards', {
                whiteCards: whiteCards
            });
        });
    });

    // The client has submitted an answer card
    socket.on('answer card', function (data) {
        console.log('received answer from ' + socket.username);
        socket.broadcast.emit('user answered', {
            username: socket.username,
            cardText: data.cardText,
            done: data.done
        });
    });

    // The game round is over
    socket.on('round over', function (data) {
        console.log('round over, all users submitted');
        socket.broadcast.emit('round over', {
            submissions: data.submissions
        });
    });

    // The client has submitted their vote
    socket.on('vote card', function (data) {
        console.log('received vote from ' + socket.username);
        socket.broadcast.emit('user voted', {
            username: socket.username,
            cardText: data.cardText,
            done: data.done
        });
    });

    // The voting is over
    socket.on('voting over', function () {
        console.log('voting over, all users voted');
        socket.broadcast.emit('voting over');
    });

    // The client was kicked from the room
    socket.on('user kicked', function () {
        if (addedUser) {
            addedUser = false;
            var index = players.indexOf(socket.username);
            if (index > -1) players.splice(index, 1);
        }
    });

    // The client or game host has disconnected
    socket.on('disconnect', function () {
        if (addedUser) {
            var index = players.indexOf(socket.username);
            if (index > -1) players.splice(index, 1);
            console.log(socket.username + ' left room');
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

