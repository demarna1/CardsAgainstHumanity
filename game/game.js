$(function() {
    // Pages
    var $newPage = $('.new.page');
    var $lobbyPage = $('.lobby.page');
    var $questionPage = $('.question.page');
    var $votePage = $('.vote.page');
    var $resultPage = $('.result.page');
    var $currentPage = $newPage;

    // Other jQuery elements
    var $newButton = $('.newButton .button');
    var $gameCode = $('.code');
    var $lobbyList = $('.lobbyList');
    var $readyLabel = $('.readyLabel .label');
    var $startButton = $('.startButton .button');
    var $questionRound = $('.question.page .title');
    var $questionLabel = $('.questionLabel .label');
    var $answeredList = $('.answeredList');
    var $roundTimer = $('.roundTimer');
    var $submittedList = $('.submittedList');
    var $voteTimer = $('.voteTimer');
    var $votedList = $('.votedList');
    var $resultList = $('.resultList');

    // State variables
    var socket = io();
    var state = null;

    function transitionTo($nextPage) {
        if ($currentPage == $nextPage) return;
        $currentPage.fadeOut();
        $nextPage.delay(400).fadeIn();
        $currentPage = $nextPage;
    }

    function updateLobby() {
        $lobbyList.empty();
        for (var i = 0; i < state.players.length; i++) {
            $lobbyList.append('<li class="lobbyPlayer">' + state.players[i] + '</li>');
        }
        if (state.players.length >= 2) {
            $readyLabel.text('All players ready?');
            $startButton.removeAttr('disabled');
        } else {
            $readyLabel.text('Need ' + (2 - state.players.length) + ' more player(s).');
            $startButton.attr('disabled', 'disabled');
        }
    }

    function startTimer(timer, duration, $triggerPage, triggerCallback) {
        var timeLeft = duration;
        var timerIntervalId = setInterval(function() {
            timer.text(timeLeft);
            if (--timeLeft < 0) {
                console.log('clearing timer interval');
                clearInterval(timerIntervalId);
                if ($currentPage == $triggerPage) {
                    triggerCallback();
                }
            }
        }, 1000);
    }

    function endRound() {
        console.log('answering has ended');
        var submittedMap = state.getSubmittedMap();
        socket.emit('round over', {
            submissions: submittedMap
        });
        $submittedList.empty();
        $votedList.empty();
        for (var user in submittedMap) {
            $submittedList.append('<li class="whiteCard"><button class="cardSpan">' + submittedMap[user] + '</button></li>');
        }
        transitionTo($votePage);
        startTimer($voteTimer, 25, $votePage, endVoting);
    }

    function endVoting() {
        console.log('voting has ended');
        socket.emit('voting over');
        $resultList.empty();
        /*for (i = 0; i < votes.length; i++) {
            console.log('appending result');
            $resultList.append('<li class="whiteCard"><button class="cardSpan">' + votes[i] + '</button></li>');
        }*/
        transitionTo($resultPage);
        /*setTimeout(function() {
            socket.emit('start game');
        }, 10000);*/
    }

    $newButton.click(function() {
        socket.emit('new game');
    });

    $startButton.click(function() {
        socket.emit('start game');
    });

    socket.on('code created', function (data) {
        state = new State(data.gameCode);
        $gameCode.text(state.gameCode);
        $lobbyList.empty();
        transitionTo($lobbyPage);
    });

    socket.on('host exists', function (data) {
        alert('Host instance already exists: ' + data.gameCode);
    });

    socket.on('user joined', function (data) {
        state.players = data.players;
        console.log('user joined, numPlayers = ' + state.players.length);
        updateLobby();
    });

    socket.on('user left', function (data) {
        state.players = data.players;
        console.log('user left, numPlayers = ' + state.players.length);
        updateLobby();
        if (state.players.length < 2) {
            state.restart();
            transitionTo($lobbyPage);
        }
    });

    socket.on('black card', function (data) {
        console.log('Q: ' + data.text);
        state.newRound();
        $questionRound.text('Round ' + state.round);
        $questionLabel.text(data.text);
        $answeredList.empty();
        transitionTo($questionPage);
        startTimer($roundTimer, 20 + 10*data.pick, $questionPage, endRound);
    });

    socket.on('audio finished', function () {
        var audio = new Audio('/game/currentq.mp3');
        audio.play();
    });

    socket.on('user answered', function (data) {
        console.log(data.username + ' answered');
        state.addUserAnswer(data.username, data.cardText, data.done);
        if (data.done) {
            console.log(data.username + ' is done');
            $answeredList.append('<li class="answeredPlayer">' +
                data.username + '</li>');
        }
        if (state.isRoundOver()) {
            endRound();
        }
    });

    socket.on('user voted', function (data) {
        console.log(data.username + ' voted');
        state.addUserVote(data.username, data.cardText, data.done);
        if (data.done) {
            $votedList.append('<li class="answeredPlayer">' +
                data.username + '</li>');
        }
        if (state.isVotingOver()) {
            endVoting();
        }
    });
});
