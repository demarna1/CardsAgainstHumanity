$(function() {
    // State variables
    var socket = io();

    // Play intro then start the game
    introAnimation(function() {
        console.log('animation ended');
        socket.emit('new game');
    });

    socket.on('code created', function(data) {
        gameLobbyDisplay(data.gameCode);
    });

    socket.on('host exists', function(data) {
        hostExistsDisplay(data.gameCode);
    });
});
