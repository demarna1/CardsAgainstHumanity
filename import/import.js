// Process arguments
if (process.argv.length < 3) {
    console.log('Usage: node import.js cah-set.json');
    return;
}
var jsonFile = process.argv[2];

// Import card set from json file
var cards = require('./' + jsonFile);
var set = jsonFile.slice(0, -5);
console.log('Loaded cards from set ' + set);

// Connect to database
var pg = require('pg');
var async = require('async');
var url = 'postgres://noah:1234@localhost/cah-node';
var client = new pg.Client(url);
client.connect(function (err) {
    if (err) {
        console.log('Unable to connect to ' + url);
        return;
    }
    console.log('Connected to database cah-node');

    async.parallel([
        // Insert black cards
        function(callback) {
            var blackCardSql = 'insert into black_cards (text, pick, used, set) values ($1, $2, $3, $4)';
            async.each(cards.blackCards, function(blackCard, callback) {
                client.query(blackCardSql, [blackCard.text, blackCard.pick, 'false', set], callback);
            }, function(err) {
                if (err) return callback(err);
                console.log('Inserted ' + cards.blackCards.length + ' black cards into database');
                callback();
            });
        },

        // Insert white cards
        function(callback) {
            var whiteCardSql = 'insert into white_cards (text, used, set) values ($1, $2, $3)';
            async.each(cards.whiteCards, function(whiteCard, callback) {
                client.query(whiteCardSql, [whiteCard, 'false', set], callback);
            }, function(err) {
                if (err) return callback(err);
                console.log('Inserted ' + cards.whiteCards.length + ' white cards into database');
                callback();
            });
        }
    ], function(err) {
        if (err) {
            console.log(err);
            client.end();
            return;
        }
        client.end();
        console.log('Done... disconnected from database');
    });
});
