var pg = require('pg');
var url = process.env.DATABASE_URL || 'postgres://noah:1234@localhost/cah-node';

module.exports = {
    blackCard: function (callback) {
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query('select text, pick from black_cards limit 1', function(err, res) {
                if (err) return callback(err);
                done();
                return callback(null, res.rows[0]);
            });
        });
    },
    whiteCards: function (count, callback) {
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query('select text from white_cards limit $1', [count], function(err, res) {
                if (err) return callback(err);
                done();
                return callback(null, res.rows.map(wc => wc.text));
            });
        });
    }
};
