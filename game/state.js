/*
 * A class to hold the game state.
 */
function State(gameCode) {
    this.gameCode = gameCode;
    this.players = [];
    this.round = 0;
    this.submissions = {};
    this.voted = {};
    this.results = [];
}

/*
 * Restarts the game state.
 */
State.prototype.restart = function() {
    this.round = 0;
    this.submissions = {};
    this.voted = {};
    this.results = [];
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].score = 0;
    }
};

/*
 * Starts a new round.
 */
State.prototype.newRound = function() {
    this.round++;
    this.submissions = {};
    this.voted = {};
    this.results = [];
};

/*
 * Add a new player.
 */
State.prototype.addUser = function(username) {
    this.players.push({
        username: username,
        score: 0
    });
};

/*
 * Remove a player.
 */
State.prototype.removeUser = function(username) {
    var indexToRemove = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].username === username) {
            indexToRemove = i;
        }
    }
    if (indexToRemove > -1) {
        this.players.splice(indexToRemove, 1);
    }
};

/*
 * Adds a user's response to the list of submissions.
 */
State.prototype.addUserAnswer = function(user, cardText, done) {
    if (user in this.submissions) {
        this.submissions[user].cards += ' / ' + cardText;
        this.submissions[user].done = done;
    } else {
        this.submissions[user] = {
            done: done,
            cards: cardText
        };
    }
};

/*
 * Determines if all users are done submitting their responses. If the
 * round is over, initialize the result list.
 */
State.prototype.isRoundOver = function() {
    var allDone = true;
    var count = 0;
    for (var user in this.submissions) {
        allDone &= this.submissions[user].done;
        count++;
    }
    return allDone && count >= this.players.length;
};

/*
 * Initialize the results list at the start of voting. Return the
 * submitted map of those users who finished before timing out.
 */
State.prototype.startVoting = function() {
    var submittedMap = {};
    for (var user in this.submissions) {
        var submission = this.submissions[user];
        if (submission.done) {
            submittedMap[user] = submission.cards;
            this.results.push({
                user: user,
                cards: submission.cards,
                voters: []
            });
        }
    }
    return submittedMap;
};

/*
 * Adds a user's vote to the voted map and the result list. Results is
 * a list of objects containing the user, their submitted cards, and
 * the list of the people who voted for them.
 */
State.prototype.addUserVote = function(user, cardText, done) {
    this.voted[user] = done;
    var userWithVote = null;
    for (var i = 0; i < this.results.length; i++) {
        if (this.results[i].cards === cardText) {
            userWithVote = this.results[i].user;
            console.log(user + ' voted for ' + userWithVote);
            this.results[i].voters.push(user);
        }
    }
    for (var i = 0; i < this.players.length; i++) {
        if (userWithVote === this.players[i].username) {
            this.players[i].score++;
        }
    }
};

/*
 * Determines if all users are done submitting their votes.
 */
State.prototype.isVotingOver = function() {
    var allDone = true;
    var count = 0;
    for (var user in this.voted) {
        allDone &= this.voted[user];
        count++;
    }
    return allDone && count >= this.players.length;
};
