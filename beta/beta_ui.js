function introAnimation(callback) {
    var exitLight = null;
    var exitDark = null;
    var canvas = document.getElementById('testCanvas');

    //showDistractor();

    /* Preload images */
    var queue = new createjs.LoadQueue();
    queue.on("complete", handleComplete, this);
    queue.loadManifest([
        { id: "exitLight", src: "/exit_light.png" },
        { id: "exitDark", src: "/exit_dark.png" }
    ]);

    /* Process loaded images */
    function handleComplete() {
        exitLight = queue.getResult("exitLight");
        exitDark = queue.getResult("exitDark");
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    /* Get the new dimensions for the canvas */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        /**
         * Your drawings need to be inside this function otherwise they will be reset when
         * you resize the browser window and the canvas goes will be cleared.
         */
        draw();
    }

    /* Draw exit image */
    function drawExitImage(stage) {
        var exit = new createjs.Bitmap(exitLight);
        var scale = 0.10 * (canvas.width / 800);
        exit.scaleX = scale;
        exit.scaleY = scale;
        exit.y = 10;
        exit.x = 5;
        stage.addChild(exit);
    }

    /* Draw title text */
    function drawTitleText(stage) {
        var jText = new createjs.Text('Cards Against Humanity', 'bold 48px Helvetica', '#fff');
        var jBounds = jText.getBounds();
        jScale = canvas.width / (jBounds.width * 2);
        jText.scaleX = jScale;
        jText.scaleY = jScale;
        jText.y = 20;
        jText.x = canvas.width / 2 - (jBounds.width*jScale) / 2;
        stage.addChild(jText);
    }

    function draw() {
        var stage = new createjs.Stage('testCanvas');
        drawExitImage(stage);
        drawTitleText(stage);

        /* Draw sample cards */
        var sampleScale = canvas.width/1000;
        var samples = [];
        var sample_y_pos = [-300,  -750, -250, -700, -550, -900, -400, -650, -200];
        var sample_srote = [ -15,    20,    5,  -30,   20,   45,  -10,  -10,    5];
        var sample_rotes = [ 0.5, -0.35, -0.2, 0.55, -0.4, -0.3, 0.25, 0.15, -0.6];
        var sample_ydiff = [  12,    12,   13,   12,   11,   13,   12,   11,   12];
        for (var i = 0; i < sample_y_pos.length; i++) {
            var sample = new createjs.Container();
            var card = new createjs.Shape();
            card.graphics.setStrokeStyle(3);
            card.graphics.beginStroke('#222');
            card.graphics.beginFill('#fff');
            card.graphics.drawRoundRect(0, 0, sampleScale * 120, sampleScale * 180, 5);
            var text = new createjs.Text('Michelle Obama\'s Arms', 'bold 14px Helvetica', '#000');
            text.x = 10;
            text.y = 10;
            text.lineWidth = sampleScale * 120 - 10;
            sample.addChild(card, text);
            sample.regX = 60;
            sample.regY = 90;
            sample.x = (canvas.width / 2) + (i-4) * ((sampleScale*120)/2 + 25);
            sample.y = sample_y_pos[i];
            samples.push(sample);
        }

        // Draw evens first, then odds on top
        for (var i = 0; i < sample_y_pos.length; i+=2) {
            stage.addChild(samples[i]);
        }
        for (var i = 1; i < sample_y_pos.length; i+=2) {
            stage.addChild(samples[i]);
        }

        createjs.Ticker.setFPS(30);
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener('tick', function() {
            var endAnimation = true;
            for (var i = 0; i < sample_y_pos.length; i++) {
                if (samples[i].y < canvas.height + 30) {
                    samples[i].rotation += sample_rotes[i];
                    samples[i].y += sample_ydiff[i];
                    endAnimation = false;
                }
            }
            if (endAnimation) {
                createjs.Ticker.removeAllEventListeners();
                callback();
                return;
            }
            stage.update();
        });
    }
}

function gameLobbyDisplay() {

}

function hostExistsDisplay() {

}
