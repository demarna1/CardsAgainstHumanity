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
    if (allDone && count >= this.players.length) {
        // Round is over
        for (var user in this.submissions) {
            this.results.push({
                user: user,
                cards: this.submissions[user].cards,
                voters: []
            });
        }
        return true;
    }
    return false;
};

/*
 * Returns a map of users and their submissions for those who finished
 * before timing out; e.g. submittedMap["name"] = "My Answer".
 */
State.prototype.getSubmittedMap = function() {
    var submittedMap = {};
    for (var user in this.submissions) {
        var submission = this.submissions[user];
        if (submission.done) {
            submittedMap[user] = submission.cards;
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
    for (var i = 0; i < this.results.length; i++) {
        if (this.results[i].cards === cardText) {
            console.log(user + ' voted for ' + this.results[i].user);
            this.results[i].voters.push(user);
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
