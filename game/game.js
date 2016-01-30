$(function() {
    // Pages
    var $newPage = $('.new.page');
    var $lobbyPage = $('.lobby.page');
    var $questionPage = $('.question.page');
    var $currentPage = $newPage;

    // Other jQuery elements
    var $newButton = $('.newButton .button');
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');
    var $questionRound = $('.question.page .title');
    var $questionLabel = $('.questionLabel .label');

    var socket = io();
    var round = 0;

    function transitionTo($nextPage) {
        if ($currentPage == $nextPage) return;
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function updateStartButton(numUsers) {
        if (numUsers >= 2) {
            $readyLabel.text('All players ready?');
            $startButton.removeAttr('disabled');
        } else {
            $readyLabel.text('Need ' + (2 - numUsers) + ' more player(s).');
            $startButton.attr('disabled', 'disabled');
        }
    }

    $newButton.click(function() {
        console.log('New game clicked');
        socket.emit('new game');
    });

    $startButton.click(function() {
        console.log('Start game clicked');
        socket.emit('start game');
    });

    socket.on('code created', function (data) {
        console.log('game created with code = ' + data.gameCode);
        $gameCode.text(data.gameCode);
        transitionTo($lobbyPage);
    });

    socket.on('host exists', function (data) {
        alert('Host instance already exists: ' + data.gameCode);
    });

    socket.on('user joined', function (data) {
        console.log('adding user ' + data.username + ' to game');
        $lobbyList.append('<li class="lobbyPlayer ' + data.username + '">' + data.username + '</li>');
        updateStartButton(data.numUsers);
    });

    socket.on('user left', function (data) {
        console.log('user ' + data.username + ' left the game');
        $('.lobbyPlayer.' + data.username).remove();
        updateStartButton(data.numUsers);
        if (data.numUsers < 2) {
            transitionTo($lobbyPage);
        }
    });

    socket.on('black card', function (data) {
        console.log('Q: ' + data.blackCard);
        ++round;
        $questionRound.text('Round ' + round);
        $questionLabel.text(data.blackCard);
        transitionTo($questionPage);
    });

    socket.on('user answered', function (data) {
        console.log(data.username + ' answered');
    });
});
