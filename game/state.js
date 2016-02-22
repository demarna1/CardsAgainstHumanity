/*
 * A class to hold the game state.
 */
function State(gameCode) {
    this.gameCode = gameCode;
    this.players = [];
    this.round = 0;
    this.submissions = {};
    this.votes = {};
}

/*
 * Restarts the game state.
 */
State.prototype.restart = function() {
    this.round = 0;
    this.submissions = {};
    this.votes = {};
};

/*
 * Starts a new round.
 */
State.prototype.newRound = function() {
    this.round++;
    this.submissions = {};
    this.votes = {};
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
 * Determines if all users are done submitting their responses.
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
 * Adds a user's vote to the list of votes.
 */
State.prototype.addUserVote = function(user, cardText, done) {
    if (user in this.votes) {
        this.votes[user].cards.push(cardText);
        this.votes[user].done = done;
    } else {
        this.votes[user] = {
            done: done,
            cards: []
        };
    }
};

/*
 * Determines if all users are done submitting their votes.
 */
State.prototype.isVotingOver = function() {
    var allDone = true;
    var count = 0;
    for (var user in this.votes) {
        allDone &= this.votes[user].done;
        count++;
    }
    return allDone && count >= this.players.length;
};
