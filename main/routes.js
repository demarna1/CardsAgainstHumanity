var path = require('path');

/*
 * Application routes go here.
 */
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.sendFile(path.resolve('main/index.html'));
    });

    app.get('/play', function(req, res) {
        res.sendFile(path.resolve('play/play.html'));
    });

    app.get('/game', function(req, res) {
        res.sendFile(path.resolve('game/game.html'));
    });

    app.get('/game/audio/q.mp3', function(req, res) {
        res.sendFile(path.resolve('game/audio/q.mp3'));
    });
}
