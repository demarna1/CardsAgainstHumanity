$(function() {
    var $roomCodeInput = $('.roomCode .input');
    var $usernameInput = $('.username .input');
    var $playButton = $('.playButton .button');
    var $loginPage = $('.login.page');
    var $waitPage = $('.wait.page');

    var socket = io();

    $playButton.click(function() {
        console.log('Play clicked');
        roomCode = $roomCodeInput.val().trim();
        username = $usernameInput.val().trim();
        if (roomCode.length == 4 && username) {
            socket.emit('login', {
                roomCode: roomCode,
                username: username
            });
        }
    });

    socket.on('login success', function (data) {
        console.log(data.username + ' logged in');
        $loginPage.fadeOut();
        $waitPage.delay(400).fadeIn();
    });

    socket.on('invalid code', function (data) {
        alert('Invalid room code: ' + data.roomCode);
    });
});
