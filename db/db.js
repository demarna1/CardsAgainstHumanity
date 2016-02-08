var pg = require('pg');
var url = process.env.DATABASE_URL || 'postgres://noah:1234@localhost/cah-node';

module.exports = {
    blackCard: function (callback) {
        var blackCardSql = 'update black_cards b1 set used=\'t\'' +
            ' from (select id, used from black_cards where used=\'f\'' +
            ' order by random() limit 1) b2 where b1.id = b2.id returning text, pick';
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query(blackCardSql, function(err, res) {
                if (err) return callback(err);
                done();
                return callback(null, res.rows[0]);
            });
        });
    },
    whiteCards: function (count, callback) {
        var whiteCardSql = 'update white_cards w1 set used=\'t\'' +
            ' from (select id, used from white_cards where used=\'f\'' +
            ' order by random() limit $1) w2 where w1.id=w2.id returning text';
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query(whiteCardSql, [count], function(err, res) {
                if (err) return callback(err);
                done();
                return callback(null, res.rows.map(wc => wc.text));
            });
        });
    }
};
