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
    var $voteList = $('.voteList');

    var socket = io();
    var username = '';
    var cardsToAnswer = 0;

    function transitionTo($nextPage) {
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function registerClicks(message) {
        $('.cardButton').click(function() {
            if ($(this).attr('class') != 'cardButton' ||
                cardsToAnswer <= 0) {
                return;
            }
            var done = (--cardsToAnswer == 0);
            console.log('card selected: ' + $(this).text() +
                ', cards to answer: ' + cardsToAnswer);
            $(this).attr('class', 'cardButtonSelected');
            socket.emit(message, {
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
        var roomCode = $roomCodeInput.val().trim();
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
        var cardsToRequest = 10 - $('.cardList li').length;
        console.log('new question, picking up ' + cardsToRequest + ' cards' +
            '; need to answer: ' + cardsToAnswer);
        socket.emit('card request', {
            numCards: cardsToRequest
        });
        transitionTo($cardPage);
    });

    socket.on('white cards', function (data) {
        console.log('recieved ' + data.whiteCards.length + ' initial cards');
        for (var i = 0; i < data.whiteCards.length; i++) {
            $cardList.append('<li class="whiteCard"><button class="cardButton">' + data.whiteCards[i] + '</button></li>');
        }
        registerClicks('answer card');
    });

    socket.on('round over', function (data) {
        transitionTo($votePage);
        $voteList.empty();
        for (var user in data.submissions) {
            if (user == username) continue;
            var cards = data.submissions[user].cards;
            var voteText = cards[0];
            for (var i = 1; i < cards.length; i++) {
                voteText += ' / ' + cards[i];
            }
            $voteList.append('<li class="whiteCard"><button class="cardButton">' + voteText + '</button></li>');
        }
        cardsToAnswer = 1;
        registerClicks('vote card');
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
