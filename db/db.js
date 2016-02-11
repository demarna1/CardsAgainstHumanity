var pg = require('pg');
var url = process.env.DATABASE_URL || 'postgres://noah:1234@localhost/cah-node';

// A better way to do table resetting:
// 1. Client requests x cards
// 2. If count of rows >= x, return with rows. Else, continue to 3.
// 3. All cards should be used at this point (since result returned < x)
// 4. Update all cards to used='false', except for x cards which we leave as true and return.

function resetTable(table) {
    console.log('Resetting table ' + table);
    var resetSql = 'update ' + table + ' set used=\'f\'';
    pg.connect(url, function(err, client, done) {
        if (err) {
            console.log('Error connecting to db');
            return;
        }
        client.query(resetSql, function(err, res) {
            if (err) {
                console.log('Error resetting table');
                return;
            }
            done();
        });
    });
}

function checkReset(table, threshold) {
    console.log('Check reset of table: ' + table);
    var countSql = 'select count(*) from ' + table + ' where used=\'f\'';
    pg.connect(url, function(err, client, done) {
        if (err) {
            console.log('Error connecting to db');
            return;
        }
        client.query(countSql, function(err, res) {
            if (err) {
                console.log('Error getting used count');
                return;
            }
            if (res.rows[0].count <= threshold) {
                resetTable(table);
            }
            done();
        });
    });
}

module.exports = {
    blackCard: function (callback) {
        var blackUpdateSql = 'update black_cards b1 set used=\'t\'' +
            ' from (select id, used from black_cards where used=\'f\'' +
            ' order by random() limit 1) b2 where b1.id = b2.id returning text, pick';
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query(blackUpdateSql, function(err, res) {
                if (err) return callback(err);
                checkReset('black_cards', 4);
                done();
                return callback(null, res.rows[0]);
            });
        });
    },
    whiteCards: function (count, callback) {
        var whiteUpdateSql = 'update white_cards w1 set used=\'t\'' +
            ' from (select id, used from white_cards where used=\'f\'' +
            ' order by random() limit $1) w2 where w1.id=w2.id returning text';
        pg.connect(url, function(err, client, done) {
            if (err) return callback(err);
            client.query(whiteUpdateSql, [count], function(err, res) {
                if (err) return callback(err);
                checkReset('white_cards', 80);
                done();
                return callback(null, res.rows.map(wc => wc.text));
            });
        });
    }
};
