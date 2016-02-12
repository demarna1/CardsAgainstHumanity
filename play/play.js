$(function() {
    // Pages
    var $loginPage = $('.login.page');
    var $waitPage = $('.wait.page');
    var $cardPage = $('.card.page');
    var $votePage = $('.vote.page');
    var $currentPage = $loginPage

    // Other jQuery elements
    var $roomCodeInput = $('.roomCode .input');
    var $usernameInput = $('.username .input');
    var $playButton = $('.playButton .button');
    var $welcomeLabel = $('.welcomeLabel .label');
    var $waitingLabel = $('.waitingLabel .label');
    var $cardList = $('.cardList');

    var socket = io();
    var username = '';
    var cardsToAnswer = 0;

    function transitionTo($nextPage) {
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function registerClicks() {
        $('.cardButton').click(function() {
            if ($(this).attr('class') != 'cardButton' ||
                cardsToAnswer <= 0) {
                return;
            }
            done = (--cardsToAnswer == 0);
            console.log('card selected: ' + $(this).text() +
                ', cards to answer: ' + cardsToAnswer);
            $(this).attr('class', 'cardButtonSelected');
            socket.emit('answer card', {
                cardText: $(this).text(),
                done: done
            });
            if (done) {
                $welcomeLabel.text('Response submitted');
                $waitingLabel.text('Waiting for other players...');
                transitionTo($waitPage);
            }
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

    socket.on('login success', function () {
        console.log(username + ' logged in');
        $welcomeLabel.text('Welcome, ' + username + '!');
        $waitingLabel.text('Waiting to start a new round...');
        transitionTo($waitPage);
    });

    socket.on('new round', function (data) {
        cardsToAnswer = data.pick;
        $('.cardButtonSelected').parent().remove();
        cardsToRequest = 10 - $('.cardList li').length;
        console.log('new question, picking up ' + cardsToRequest + ' cards' +
            '; need to answer: ' + cardsToAnswer);
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

    socket.on('round over', function (data) {
        transitionTo($votePage);
    });

    socket.on('login error', function (data) {
        alert('Error joining: ' + data.error);
    });

    socket.on('host left', function (data) {
        $roomCodeInput.val('');
        cardsToAnswer = 0;
        transitionTo($loginPage);
        socket.emit('user kicked');
        alert('Host from room ' + data.gameCode + ' has disconnected');
    });
});
