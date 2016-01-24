$(function() {
    var $newButton = $('.newButton .button');
    var $newPage = $('.new.page');
    var $lobbyPage = $('.lobby.page');
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');

    var socket = io();

    $newButton.click(function() {
        console.log('New game clicked');
        socket.emit('new game');
    });

    socket.on('code created', function (data) {
        console.log('game created with code = ' + data.gameCode);
        $gameCode.text(data.gameCode);
        $newPage.fadeOut();
        $lobbyPage.delay(400).fadeIn();
    });

    socket.on('user joined', function (data) {
        console.log('adding user ' + data.username + ' to game');
        $lobbyList.append('<li class="lobbyPlayer">' + data.username + '</li>');
    });
});
