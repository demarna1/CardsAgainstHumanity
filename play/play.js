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

    socket.on('invalid code', function (data) {
        alert('Invalid room code: ' + data.roomCode);
    });

    socket.on('host left', function (data) {
        $roomCodeInput.val('');
        transitionTo($loginPage);
        socket.emit('user kicked');
        alert('Host from room ' + data.gameCode + ' has disconnected');
    });

    socket.on('initial cards', function (data) {
        console.log('recieved ' + data.whiteCards.length + ' initial cards');
        $cardList.empty();
        for (i = 0; i < data.whiteCards.length; i++) {
            $cardList.append('<li class="whiteCard' + i +
              '"><input class="cardButton" type="button" value="' +
              data.whiteCards[i] + '"/></li>');
        }
        $('.cardButton').each(cardClick(index, element)); {
            console.log('register click for ' + index);
            $(element).click(function() {
                selectedCard = $(element).parent().attr('class');
                console.log('selected ' + selectedCard);
                $(element).attr('class', 'cardButtonSelected');
            });
        });
        transitionTo($cardPage);
    });
});
