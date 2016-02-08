$(function() {
    // Pages
    var $newPage = $('.new.page');
    var $lobbyPage = $('.lobby.page');
    var $questionPage = $('.question.page');
    var $votePage = $('.vote.page');
    var $currentPage = $newPage;

    // Other jQuery elements
    var $newButton = $('.newButton .button');
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');
    var $questionRound = $('.question.page .title');
    var $questionLabel = $('.questionLabel .label');
    var $answeredList = $('.answeredList');

    var socket = io();
    var round = 0;
    var players = [];
    var submissions = {};

    function transitionTo($nextPage) {
        if ($currentPage == $nextPage) return;
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function updateLobby() {
        $lobbyList.empty();
        for (i = 0; i < players.length; i++) {
            $lobbyList.append('<li class="lobbyPlayer">' + players[i] + '</li>');
        }
        if (players.length >= 2) {
            $readyLabel.text('All players ready?');
            $startButton.removeAttr('disabled');
        } else {
            $readyLabel.text('Need ' + (2 - players.length) + ' more player(s).');
            $startButton.attr('disabled', 'disabled');
        }
    }

    $newButton.click(function() {
        socket.emit('new game');
    });

    $startButton.click(function() {
        socket.emit('start game');
    });

    socket.on('code created', function (data) {
        $gameCode.text(data.gameCode);
        transitionTo($lobbyPage);
    });

    socket.on('host exists', function (data) {
        alert('Host instance already exists: ' + data.gameCode);
    });

    socket.on('user joined', function (data) {
        players = data.players;
        console.log('user joined, numPlayers = ' + players.length);
        updateLobby();
    });

    socket.on('user left', function (data) {
        players = data.players;
        console.log('user left, numPlayers = ' + players.length);
        updateLobby();
        if (players.length < 2) {
            round = 0;
            submissions = {};
            transitionTo($lobbyPage);
        }
    });

    socket.on('black card', function (data) {
        console.log('Q: ' + data.text);
        ++round;
        $questionRound.text('Round ' + round);
        $questionLabel.text(data.text);
        transitionTo($questionPage);
    });

    socket.on('audio finished', function () {
        audio = new Audio('/game/currentq.mp3');
        audio.play();
    });

    socket.on('user answered', function (data) {
        console.log(data.username + ' answered');
        if (data.username in submissions) {
            submissions[data.username].cards.push(data.cardText);
        } else {
            submissions[data.username] = {
                done: false,
                cards: [data.cardText]
            };
        }
        if (data.done) {
            console.log(data.username + ' is done');
            submissions[data.username].done = true;
            $answeredList.append('<li class="answeredPlayer">' +
                data.username + '</li>');
        }
        transition = true;
        count = 0;
        for (var i in submissions) {
            transition &= submissions[i].done;
            count++;
        }
        if (transition && count >= players.length) {
            transitionTo($votePage);
        }
    });
});
