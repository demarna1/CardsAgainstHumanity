$(function() {
    // Pages
    var $loginPage = $('.login.page');
    var $waitPage = $('.wait.page');
    var $cardPage = $('.card.page');
    var $currentPage = $loginPage

    // Other jQuery elements
    var $roomCodeInput = $('.roomCode .input');
    var $usernameInput = $('.username .input');
    var $playButton = $('.playButton .button');
    var $welcomeLabel = $('.welcomeLabel .label');
    var $cardList = $('.cardList');

    var socket = io();

    function transitionTo($nextPage) {
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function registerClicks() {
        $('.cardButton').click(function() {
            console.log('card selected');
            $(this).attr('class', 'cardButtonSelected');
        });
    }

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
        $welcomeLabel.text('Welcome, ' + data.username + '!');
        transitionTo($waitPage);
    });

    socket.on('new round', function () {
        cardsToRequest = 10 - $('.cardList li').length;
        console.log('new round starting, need ' + cardsToRequest + ' cards');
        socket.emit('card request', {
            numCards: cardsToRequest
        });
        transitionTo($cardPage);
    });

    socket.on('white cards', function (data) {
        console.log('recieved ' + data.whiteCards.length + ' initial cards');
        for (i = 0; i < data.whiteCards.length; i++) {
            $cardList.append('<li class="whiteCard"><button class="cardButton">' + data.whiteCards[i] + '</button></li>');
        }
        registerClicks();
    });

    socket.on('invalid code', function (data) {
        alert('Invalid room code: ' + data.roomCode);
    });

    socket.on('host left', function (data) {
        $roomCodeInput.val('');
        transitionTo($loginPage);
        socket.emit('user kicked');
        alert('Host from room ' + data.gameCode + ' has disconnected');
    });
});
