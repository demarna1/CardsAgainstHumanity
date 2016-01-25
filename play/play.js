$(function() {
    var $roomCodeInput = $('.roomCode .input');
    var $usernameInput = $('.username .input');
    var $playButton = $('.playButton .button');
    var $loginPage = $('.login.page');
    var $waitPage = $('.wait.page');
    var $welcomeLabel = $('.welcomeLabel .label');

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
        $welcomeLabel.text('Welcome, ' + data.username + '!');
    });

    socket.on('invalid code', function (data) {
        alert('Invalid room code: ' + data.roomCode);
    });

    socket.on('host left', function (data) {
        $waitPage.fadeOut();
        $loginPage.delay(400).fadeIn();
        $roomCodeInput.val('');
        socket.emit('user kicked');
        alert('Host from room ' + data.gameCode + ' has disconnected');
    });
});
