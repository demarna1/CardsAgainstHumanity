$(function() {
    var $newButton = $('.newButton .button');
    var $newPage = $('.new.page');
    var $lobbyPage = $('.lobby.page');
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');

    var socket = io();

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
    });

    socket.on('code created', function (data) {
        console.log('game created with code = ' + data.gameCode);
        $gameCode.text(data.gameCode);
        $newPage.fadeOut();
        $lobbyPage.delay(400).fadeIn();
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
    });
});
