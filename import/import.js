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

    // Insert black cards
    for (i = 0; i < cards.blackCards.length; i++) {
        blackCard = cards.blackCards[i];
        client.query('insert into black_cards (text, pick, used, set) values ($1, $2, $3, $4)',
            [blackCard.text, blackCard.pick, 'false', set], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log('success');
        });
        break;
    }
    console.log('Inserted ' + cards.blackCards.length + ' black cards into database');

    // Insert white cards
    for (i = 0; i < cards.whiteCards.length; i++) {
        whiteCard = cards.whiteCards[i];
        client.query('insert into white_cards (text, used, set) values ($1, $2, $3)',
            [whiteCard, 'false', set], function (err, result) {
            if (err) {
                console.log(err);
            }
            console.log('success');
        });
        break;
    }
    console.log('Inserted ' + cards.whiteCards.length + ' white cards into database');

    client.end();
});
