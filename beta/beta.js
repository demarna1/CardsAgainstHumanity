$(function() {
    var tradImage = null;
    var koImage = null;
    var canvas = document.getElementById('testCanvas');

    //showDistractor();

    /* Preload images */
    var queue = new createjs.LoadQueue();
    queue.on("complete", handleComplete, this);
    queue.loadManifest([
        { id: "trad", src: "/traditional.png" },
        { id: "ko", src: "/knockout.png" }
    ]);

    /* Process loaded images */
    function handleComplete() {
        tradImage = queue.getResult("trad");
        koImage = queue.getResult("ko");
        window.addEventListener('resize', resizeCanvas, false);
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

    function draw() {
        var stage = new createjs.Stage('testCanvas');

        /* Draw trad image */
        var trad = new createjs.Bitmap(tradImage);
        var tScale = 0.5 * (canvas.width / 800);
        trad.scaleX = tScale;
        trad.scaleY = tScale;
        trad.y = canvas.height / 2;
        trad.x = canvas.width / 2;
        stage.addChild(trad);

        /* Draw Title text */
        var jText = new createjs.Text('Cards Against Humanity', 'bold 48px Helvetica', '#fff');
        var jBounds = jText.getBounds();
        jScale = canvas.width / (jBounds.width * 2);
        jText.scaleX = jScale;
        jText.scaleY = jScale;
        jText.y = 20;
        jText.x = canvas.width / 2 - (jBounds.width*jScale) / 2;
        stage.addChild(jText);

        /* Draw sample cards */
        var samples = [];
        for (var i = 0; i < 5; i++) {
            var sample = new createjs.Shape();
            sample.graphics.beginFill('#fff');
            sample.graphics.drawRoundRect(0, 0, 120, 180, 5);
            sample.regX = 60;
            sample.regY = 90;
            sample.x = (canvas.width / 2) - (i * 120 - 240);
            if (i % 3 == 0) {
                sample.y = -180;
            } else if (i % 3 == 1) {
                sample.y = -90;
            } else {
                sample.y = -270;
            }
            samples.push(sample);
            stage.addChild(sample);
        }

        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener('tick', function() {
            for (var i = 0; i < 5; i++) {
                if (samples[i].y < canvas.height - 10) {
                    if (i % 2 == 0) {
                        samples[i].rotation += 1;
                    } else {
                        samples[i].rotation -= 1;
                    }
                    samples[i].y += 10;
                }
            }
            stage.update();
        });
    }
});
