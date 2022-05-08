﻿var c = document.getElementById("main");
var ctx = c.getContext("2d");
var txtTop = document.getElementById("txtTop");
var spd1 = document.getElementById("spd1");
var g = document.getElementById("g");
var md = document.getElementById("md");
var ri = document.getElementById("ri");
var ci = document.getElementById("ci");
var bg = document.getElementById("bg");
var posX = document.getElementById("posX");
var posY = document.getElementById("posY");
var fps = document.getElementById("fps");
var direct = document.getElementById("direct");
var total = document.getElementById("total");
var keyCode = document.getElementById("keyCode");
var tg = document.getElementById("tg");
var ActorY = document.getElementById("ActorY");
var ActorX = document.getElementById("ActorX");
var jmp = document.getElementById("jmp");
var warpx = document.getElementById("warpx");
var warpy = document.getElementById("warpy");
var dt = document.getElementById("dt");
var dd = document.getElementById("dd");
var Actors = [];
var defaultSide = 24;
var defaultWidth = defaultSide;
var defaultHeight = defaultSide;
var showTilesID = false;
var ticks = 0;
var tracks = [];
var currentTrack = 0;
var lastPausedState = false;
var trackLoop = [];
var started = false;
var blinkText = 0;
var fadeIn = true;
//BackGround matrix (10x10);
var BackGround = [];
var darknessBuffer = [];
var switchBuffer = [];
var previousTime = 0.0;
var currentTime = 0.0;
var deltaTime = 0.0;
var growers = [];
var disableBG = false;
var disableDraw = false;
var drawDepth = 0;
var marioBG = [];
var preRenderedTiles = [];
var saveScreen = null;
var showScreen = false;
var gravityForce = 0.18;
var shadow = document.createElement("canvas");
var ctxShadow = shadow.getContext("2d");
var camera = {
    x: 0,
    y: 0,
    fixed: false
};

var TYPE = {
    WALL: 0,
    CIRCLE: 1,
    BOUNCER: 2,
    PLATFORM: 3,
    ACTOR: 4,
    GROWER: 5,
    SWITCH: 6,
    PILLAR: 7,
    CRATE: 8,
    BOX: 9,
    TUNNEL: 10,
    GLOVE: 11,
    SLOPENE: 12,
    SLOPESE: 13,
    SLOPESW: 14,
    SLOPENW: 15,
    DARKNESS: 16,
    LIGHT: 17,
    TURTLE: 18,
    WALLJUMP: 19,
    BACKGROUND: 20,
    MARIO: 21,
    SAVE: 22,
    CHECKPOINT: 23,
    VELOCITY: 24,
    SUPERJUMP: 25,
    SENTRY:26
};
function getType(type) {
    switch (type) {
        case "X":
            return TYPE.WALL;
        case "B":
            return TYPE.BOUNCER;
        case "G":
            return TYPE.GROWER;
        case "S":
            return TYPE.SWITCH;
        case "P":
            return TYPE.PILLAR;
        case "C":
            return TYPE.CRATE;
        case "b":
            return TYPE.BOX;
        case "p":
            return TYPE.PLATFORM;
        case "T":
            return TYPE.TUNNEL;
        case "c":
            return TYPE.CIRCLE;
        case "g":
            return TYPE.GLOVE;
        case "╗":
            return TYPE.SLOPENE;
        case "╝":
            return TYPE.SLOPESE;
        case "╚":
            return TYPE.SLOPESW;
        case "╔":
            return TYPE.SLOPENW;
        case "D":
            return TYPE.DARKNESS;
        case "l":
            return TYPE.LIGHT;
        case "t":
            return TYPE.TURTLE;
        case "j":
            return TYPE.WALLJUMP;
        case "M":
            return TYPE.MARIO;
        case "s":
            return TYPE.SAVE;
        case "h":
            return TYPE.CHECKPOINT;
        case "v":
            return TYPE.VELOCITY;
        case "j":
            return TYPE.SUPERJUMP;
        case "e":
            return TYPE.SENTRY;
    }
}


var Objects = [];
var start = false;
var worldWidth = 0;
var worldHeight = 0;
//var running = false;
var direction = "R";
window.addEventListener("keydown", doKeyDown, false);
window.addEventListener("keyup", doKeyUp, false);
window.addEventListener("mousedown", doKeyDown);
var keyDown = 0;
// 0 left, 1 right
var keysPressed = [false, false];
String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};
function doKeyDown(e)
{
    keyCode.value = e.keyCode;

    if (!started)
    {
        started = true;
        tracks[currentTrack].pause();
        currentTrack = 1;
        Simulation();
        return;
    }

    if (!paused) {

        if (e.keyCode == 100 || e.keyCode == 68 || e.keyCode == 39) {
            direction = "R";
            //Balls[0].speed = 2;
        }
        if (e.keyCode == 97 || e.keyCode == 65 || e.keyCode == 37) {
            direction = "L";
            //Balls[0].speed = -2;
        }

        if (e.keyCode == 100 || e.keyCode == 68 || e.keyCode == 97 || e.keyCode == 65 || e.keyCode == 37 || e.keyCode == 39) {
            if (e.keyCode == 65 || e.keyCode == 37)
                keysPressed[0] = true;

            if (e.keyCode == 68 || e.keyCode == 39)
                keysPressed[1] = true;

            if (!Actors[0].running) {
                Actors[0].running = true;
                Actors[0].ResetLimbs();                
            }
        }

        if (e.keyCode == 32 && (!Actors[0].falling || Actors[0].wallSlide)) {

            if (Actors[0].jumpPressed)
                return;

            if (Actors[0].jump == 0) {
                Actors[0].jumpPressed = true;
                Actors[0].jump = -0.1;
            }
            if (e.preventDefault)
                e.preventDefault();
        }
    }
    else
    {
        if (e.keyCode == 100 || e.keyCode == 68) {
            if (tracks[currentTrack].volume + .1 < 1)
                ChangeTracksVolume(true);
            DrawPauseScreen(true);
        }
        if (e.keyCode == 97 || e.keyCode == 65) {
            if (tracks[currentTrack].volume - .1 > 0)
                ChangeTracksVolume(false);;
            DrawPauseScreen(true);
        }
    }



    if(e.keyCode == 27)
    {
        paused = !paused;
        if (!paused)
            tracks[currentTrack].play();
        if(e.preventDefault)
            e.preventDefault();
        window.requestAnimationFrame(Animate);
    }

    
}
function ChangeTracksVolume(increase)
{
    for(var i = 0,trackItem;trackItem = tracks[i];i++)
    {
        if(increase)
            trackItem.volume += .1;
        else
            trackItem.volume -= .1;
    }
}
function doKeyUp(e) {
    if (e.keyCode == 100 || e.keyCode == 68 || e.keyCode == 97 || e.keyCode == 65 || e.keyCode == 37 || e.keyCode == 39) {

        if (e.keyCode == 65 || e.keyCode == 37)
            keysPressed[0] = false;

        if (e.keyCode == 68 || e.keyCode == 39)
            keysPressed[1] = false;

        if (!keysPressed[0] && !keysPressed[1]) {
            Actors[0].running = false;
            Actors[0].ResetLimbs();
        }
    }

    if (e.keyCode == 32 /*&& !Balls[0].falling*/) {
        //Balls[0].falling = true;
        //Balls[0].ResetLimbs();
        Actors[0].jumpPressed = false;
        //gravity = -3.5;

        if (e.preventDefault)
            e.preventDefault();
    }

}
window.addEventListener('load', function () { // on page load
    
    document.getElementById("btnMoveLeft").addEventListener('touchstart', function (e) {
        e.preventDefault();
        var key = { keyCode: 37 };
        doKeyDown(key);
    }, false);

    document.getElementById("btnMoveRight").addEventListener('touchstart', function (e) {
        e.preventDefault();
        var key = { keyCode: 39 };
        doKeyDown(key);
    }, false);

    document.getElementById("btnJump").addEventListener('touchstart', function (e) {
        e.preventDefault();
        var key = { keyCode: 32 };
        doKeyDown(key);
    }, false);

    document.getElementById("btnMoveLeft").addEventListener('touchend', function (e) {
        e.preventDefault();
        var key = { keyCode: 37 };
        doKeyUp(key);
    }, false);

    document.getElementById("btnMoveRight").addEventListener('touchend', function (e) {
        e.preventDefault();
        var key = { keyCode: 39 };
        doKeyUp(key);
    }, false);

    document.getElementById("btnJump").addEventListener('touchend', function (e) {
        e.preventDefault();
        var key = { keyCode: 32 };
        doKeyUp(key);
    }, false);

}, false);

/**** zoom *****/
var scale = 1;
var originx = 0;
var originy = 0;
var zoom = 1;
c.onmousewheel = function (event) {
    var mousex = event.clientX - c.offsetLeft;
    var mousey = event.clientY - c.offsetTop;
    var wheel = event.wheelDelta / 120;//n or -n

    zoom = 1 + wheel / 2;

    ctx.translate(
        originx,
        originy
    );
    ctx.scale(zoom, zoom);
    ctx.translate(
        -(mousex / scale + originx - mousex / (scale * zoom)),
        -(mousey / scale + originy - mousey / (scale * zoom))
    );

    originx = (mousex / scale + originx - mousex / (scale * zoom));
    originy = (mousey / scale + originy - mousey / (scale * zoom));
    scale *= zoom;
}
/**** zoom *****/

function Warp()
{
    if (warpx.value != "" && warpy.value != "") {
        Actors[0].y = (warpx.value * defaultWidth) + Actors[0].vRadius;
        Actors[0].x = (warpy.value * defaultHeight) + this.defaultWidth / 2;

        //scroller = Actors[0].x;
        //moveDown = Actors[0].y - (4 * defaultHeight) > 0 ? Actors[0].y - (4 * defaultHeight) : 0;
    }
}

function Init()
{
    tracks[0] = new Audio("music/title.mp3");
    tracks[0].volume = 0;
    tracks[1] = new Audio("music/track_1.mp3");
    tracks[1].volume = 0;
    trackLoop[1] = 62.769517;
    tracks[2] = new Audio("music/track_2.mp3");
    tracks[2].volume = 0;
    tracks[3] = new Audio("music/track_3.mp3");
    tracks[3].volume = 0;
    trackLoop[3] = 0;

    var auxCanvas = document.createElement('canvas');
    auxCanvas.width = 64;
    auxCanvas.height = 64;
    var auxCanvasCtx = auxCanvas.getContext('2d');

    
    var imgLeft = document.getElementById("btnMoveLeft");
    auxCanvasCtx.beginPath();
    auxCanvasCtx.fillStyle = "#aaaaaa";
    auxCanvasCtx.fillRect(0, 0, auxCanvas.width, auxCanvas.height);
    auxCanvasCtx.fillStyle = "#000000";
    auxCanvasCtx.moveTo(48, 16);
    auxCanvasCtx.lineTo(48, 48);
    auxCanvasCtx.lineTo(16, 32);
    auxCanvasCtx.fill();
    imgLeft.src = auxCanvas.toDataURL("image/png");

    var imgRight = document.getElementById("btnMoveRight");
    auxCanvasCtx.beginPath();
    auxCanvasCtx.fillStyle = "#aaaaaa";
    auxCanvasCtx.fillRect(0, 0, auxCanvas.width, auxCanvas.height);
    auxCanvasCtx.fillStyle = "#000000";
    auxCanvasCtx.moveTo(16, 16);
    auxCanvasCtx.lineTo(16, 48);
    auxCanvasCtx.lineTo(48, 32);
    auxCanvasCtx.fill();
    imgRight.src = auxCanvas.toDataURL("image/png");

    var imgJump = document.getElementById("btnJump");
    auxCanvasCtx.beginPath();
    auxCanvasCtx.fillStyle = "#aaaaaa";
    auxCanvasCtx.fillRect(0, 0, auxCanvas.width, auxCanvas.height);
    auxCanvasCtx.fillStyle = "#000000";
    auxCanvasCtx.arc(auxCanvas.width / 2, auxCanvas.height / 2, 16, 0, 2 * Math.PI);
    auxCanvasCtx.fill();
    imgJump.src = auxCanvas.toDataURL("image/png");

}

function PreRenderTile(obj) {
    var renderer = document.createElement('canvas');
    renderer.width = obj.width;
    renderer.height = obj.height;
    var rendererCtx = renderer.getContext('2d');


    if (obj.type == TYPE.MARIO) {
        var subTiles = obj.edges.toString(2).paddingLeft("00000000");
        var t_x, t_y, t_w, t_h = [];
    
        rendererCtx.fillStyle = "rgba(201,152,86,1)";
        rendererCtx.rect(0, 0, defaultSide, defaultSide);
        if ((subTiles[0] == 1 && subTiles[2] == 1) ||
            (subTiles[2] == 1 && subTiles[4] == 1) ||
            (subTiles[4] == 1 && subTiles[6] == 1) ||
            (subTiles[6] == 1 && subTiles[0] == 1)) {
            if (subTiles[0] == 1 && subTiles[2] == 1) {
                rendererCtx.rect(24, 0, -8, 8);
            }
            if (subTiles[2] == 1 && subTiles[4] == 1) {
                rendererCtx.rect(24, 16, -8, 8);
            }
            if (subTiles[4] == 1 && subTiles[6] == 1) {
                rendererCtx.rect(8, 16, -8, 8);
            }
            if (subTiles[6] == 1 && subTiles[0] == 1) {
                rendererCtx.rect(8, 0, -8, 8);
            }
        }
        rendererCtx.fill();
        rendererCtx.fillStyle = "rgba(224,190,80,1)";
        rendererCtx.fillRect(0 + 6, 0 + 14, 2, 3);
        rendererCtx.fillRect(0 + 12, 0 + 18, 1, 2);
        rendererCtx.fillRect(0 + 17, 0 + 13, 2, 3);
        rendererCtx.fillRect(0 + 5, 0 + 8, 1, 2);
        rendererCtx.fillRect(0 + 11, 0 + 12, 1, 2);
        rendererCtx.fillRect(0 + 5, 0 + 3, 2, 3);
        rendererCtx.fillRect(0 + 12, 0 + 5, 1, 3);
        rendererCtx.fillRect(0 + 17, 0 + 9, 1, 2);
    
        //Type D
        if ((subTiles[0] == 1 && subTiles[2] == 1) ||
            (subTiles[2] == 1 && subTiles[4] == 1) ||
            (subTiles[4] == 1 && subTiles[6] == 1) ||
            (subTiles[6] == 1 && subTiles[0] == 1)) {
            if (subTiles[0] == 1 && subTiles[2]== 1) {
                rendererCtx.beginPath();
                t_x = [16,24,24,24,16,20,22,23,16,16,18,21,16,17,16,18,19,20];
                t_y = [ 0, 0, 1, 2, 0, 1, 2, 4, 4, 1, 2, 4, 5, 7, 3, 4, 5, 6];
                t_w = [ 8,-4,-2,-1, 4, 2, 1, 1, 4, 4, 4, 2, 1, 2, 2, 1, 1, 1];
                t_h = [ 8, 1, 1, 2, 1, 1, 2, 4, 4, 2, 4, 4, 3, 1, 1, 2, 1, 2];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "D");

                rendererCtx.fillStyle = "rgba(201,152,86,1)";
            }
            if (subTiles[2]== 1 && subTiles[4]== 1) {
                rendererCtx.beginPath();                
                t_x = [16,24,23,22,23,22,20,16,16,21,18,16,16,16,20,18,18,16];
                t_y = [16,20,22,23,16,20,22,23,16,16,18,21,16,17,16,18,19,20];
                t_w = [ 8,-1,-1,-2, 1, 1, 2, 4, 4, 2, 4, 4, 3, 1, 1, 2, 1, 2];
                t_h = [ 8, 4, 2, 1, 4, 2, 1, 1, 4, 4, 4, 2, 1, 2, 2, 1, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "D");

                rendererCtx.fillStyle = "rgba(201,152,86,1)";
            }
            if (subTiles[4] == 1 && subTiles[6] == 1) {
                rendererCtx.beginPath();                
                t_x = [ 0, 0, 0, 0, 0, 1, 2, 4, 4, 4, 2, 1, 7, 5, 6, 5, 4, 3];
                t_y = [16,24,23,22,16,20,22,23,16,21,18,16,16,16,20,18,18,16];
                t_w = [ 8, 4, 2, 1, 1, 1, 2, 4, 4, 4, 4, 2, 1, 2, 2, 1, 1, 1];
                t_h = [ 8,-1,-1,-2, 4, 2, 1, 1, 4, 2, 4, 4, 3, 1, 1, 2, 1, 2];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "D");

                rendererCtx.fillStyle = "rgba(201,152,86,1)";
            }
            if (subTiles[6] == 1 && subTiles[0]== 1) {
                rendererCtx.beginPath();
                t_x = [ 0, 4, 2, 1, 4, 2, 1, 0, 4, 1, 2, 4, 5, 7, 3, 4, 5, 6];
                t_y = [ 0, 0, 1, 2, 0, 1, 2, 4, 4, 4, 2, 1, 7, 5, 6, 5, 4, 3];
                t_w = [ 8,-4,-2,-1, 4, 2, 1, 1, 4, 2, 4, 4, 3, 1, 1, 2, 1, 2];
                t_h = [ 8, 1, 1, 2, 1, 1, 2, 4, 4, 4, 4, 2, 1, 2, 2, 1, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "D");
                rendererCtx.fillStyle = "rgba(201,152,86,1)";
            }
        } 



        //Type B and C
        if ((subTiles[0] == 0 && subTiles[2] == 1) || (subTiles[2] == 1 && subTiles[4] == 0) ||
            (subTiles[2] == 0 && subTiles[4] == 1) || (subTiles[4] == 1 && subTiles[6] == 0) ||
            (subTiles[4] == 0 && subTiles[6] == 1) || (subTiles[6] == 1 && subTiles[0] == 0) ||
            (subTiles[6] == 0 && subTiles[0] == 1) || (subTiles[0] == 1 && subTiles[2] == 0)) {
            if ((subTiles[6] == 0 && subTiles[0] == 1) || (subTiles[0] == 1 && subTiles[2] == 0)) {
                if (subTiles[2] == 0) {
                    t_x = [16,16,16,18,23,16,18,23];
                    t_y = [ 0, 1, 6, 5, 6, 4, 3, 4];
                    t_w = [ 8, 8, 2, 5, 1, 2, 5, 1];
                    t_h = [ 6, 3, 2, 2, 2, 1, 1, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "B");
                }
                if (subTiles[6] == 0) {
                    t_x = [ 0, 0, 0, 1, 6, 0, 1,06];
                    t_y = [ 0, 1, 6, 7, 6, 4, 5, 4];
                    t_w = [ 8, 8, 1, 6, 2, 1, 5, 2];
                    t_h = [ 7, 4, 2, 1, 1, 1, 1, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "C");
                }
            }
            if ((subTiles[0] == 0 && subTiles[2] == 1) || (subTiles[2] == 1 && subTiles[4] == 0))
            {
                if (subTiles[4] == 0) {
                    t_x = [18,20,16,17,16,19,20,19];
                    t_y = [16,16,16,18,23,16,18,23];
                    t_w = [ 6, 3, 2, 2, 2, 1, 1, 1];
                    t_h = [ 8, 8, 2, 5, 1, 2, 5, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "B");
                }
                if (subTiles[0] == 0) {
                    t_x = [17,19,16,16,17,19,18,19];
                    t_y = [ 0, 0, 0, 1, 6, 0, 1, 6];
                    t_w = [ 7, 4, 2, 1, 1, 1, 1, 1];
                    t_h = [ 8, 8, 1, 6, 2, 1, 5, 2];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "C");
                }
            }
            if ((subTiles[2] == 0 && subTiles[4] == 1) || (subTiles[4] == 1 && subTiles[6] == 0))
            {
                if (subTiles[6] == 0) {
                    t_x = [ 0, 0, 0, 1, 6, 0, 1, 6];
                    t_y = [18,20,16,17,16,19,20,19];
                    t_w = [ 8, 8, 1, 5, 2, 1, 5, 2];
                    t_h = [ 7, 3, 2, 2, 2, 1, 1, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "B");
                }
                if (subTiles[2] == 0) {
                    t_x = [16,16,23,17,16,23,18,16];
                    t_y = [17,19,16,16,17,19,18,19];
                    t_w = [ 8, 8, 1, 6, 2, 1, 5, 2];
                    t_h = [ 7, 4, 2, 1, 1, 1, 1, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "C");
                }
            }
            if((subTiles[4] == 0 && subTiles[6] == 1) || (subTiles[6] == 1 && subTiles[0] == 0))
            {
                if (subTiles[0] == 0) {
                    t_x = [ 0, 1, 6, 5, 6, 4, 3, 4];
                    t_y = [ 0, 0, 7, 1, 0, 6, 1, 0];
                    t_w = [ 6, 3, 2, 2, 2, 1, 1, 1];
                    t_h = [ 8, 8, 2, 5, 1, 2, 5, 1];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "B");
                }
                if (subTiles[4] == 0) {
                    t_x = [ 0, 1, 6, 7, 6, 4, 5, 4];
                    t_y = [16,16,23,17,16,23,18,16];
                    t_w = [ 7, 4, 2, 1, 1, 1, 1, 1];
                    t_h = [ 8, 8, 1, 6, 2, 1, 5, 2];
                    DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "C");
                }
            }
        }

        //TypeA
        if (subTiles[0] == 1 || subTiles[2] == 1 || subTiles[4] == 1 || subTiles[6] == 1) {            
            if (subTiles[0] == 1) {
                t_x = [8, 8, 8, 13, 8, 13];
                t_y = [0, 1, 5, 6, 3, 4];
                t_w = [8, 8, 5, 3, 5, 3];
                t_h = [6, 3, 2, 2, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "A");
            }
            if (subTiles[2] == 1) {
                t_x = [18, 20, 17, 16, 20, 19];
                t_y = [8, 8, 8, 13, 8, 13];
                t_w = [6, 3, 2, 2, 1, 1];
                t_h = [8, 8, 5, 3, 5, 3];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "A");
            }
            if (subTiles[4] == 1) {
                t_x = [8, 8, 11, 8, 11, 8];
                t_y = [18, 20, 17, 16, 20, 19];
                t_w = [8, 8, 5, 3, 5, 3];
                t_h = [6, 3, 2, 2, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "A");
            }
            if (subTiles[6] == 1) {
                t_x = [0, 1, 5, 6, 3, 4];
                t_y = [8, 8, 11, 8, 11, 8];
                t_w = [6, 3, 2, 2, 1, 1];
                t_h = [8, 8, 5, 3, 5, 3];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "A");
            }
        }

        //Type E
        if ((subTiles[0] == 0 && subTiles[1] == 1 && subTiles[2] == 0) ||
            (subTiles[2] == 0 && subTiles[3] == 1 && subTiles[4] == 0) ||
            (subTiles[4] == 0 && subTiles[5] == 1 && subTiles[6] == 0) ||
            (subTiles[6] == 0 && subTiles[7] == 1 && subTiles[0] == 0))
        {
            if (subTiles[0] == 0 && subTiles[1] == 1 && subTiles[2] == 0) {
                t_x = [18,23,20,17,18,19,20,22,19,20,21,23];
                t_y = [ 0, 5, 0, 0, 1, 4, 5, 6, 0, 1, 3, 4];
                t_w = [ 6, 1, 4, 1, 1, 1, 3, 2, 1, 1, 2, 1];
                t_h = [ 5, 1, 4, 1, 4, 2, 1, 1, 1, 3, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "E");
            }
            if (subTiles[2] == 0 && subTiles[3] == 1 && subTiles[4] == 0) {
                t_x = [19,18,20,23,19,18,18,17,23,20,20,19];
                t_y = [18,23,20,17,18,19,20,22,19,20,21,23];
                t_w = [ 5, 1, 4, 1, 4, 2, 1, 1, 1, 3, 1, 1];
                t_h = [ 6, 1, 4, 1, 1, 1, 3, 2, 1, 1, 2, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "E");
            }
            if(subTiles[4] == 0 && subTiles[5] == 1 && subTiles[6] == 0)
            {
                t_x = [ 0, 0, 0, 6, 5, 4, 1, 0, 4, 3, 1, 0];
                t_y = [19,18,20,23,19,18,18,17,23,20,20,19];
                t_w = [ 6, 1, 4, 1, 1, 1, 3, 2, 1, 1, 2, 1];
                t_h = [ 5, 1, 4, 1, 4, 2, 1, 1, 1, 3, 1, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "E");
            }
            if (subTiles[6] == 0 && subTiles[7] == 1 && subTiles[0] == 0) {
                t_x = [ 0, 5, 0, 0, 1, 4, 5, 6, 0, 1, 3, 4];
                t_y = [ 0, 0, 0, 6, 5, 4, 1, 0, 4, 3, 1, 0];
                t_w = [ 5, 1, 4, 1, 4, 2, 1, 1, 1, 3, 1, 1];
                t_h = [ 6, 1, 4, 1, 1, 1, 3, 2, 1, 1, 2, 1];
                DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, "E");
            }
            
        }
        if (!marioBG[obj.edges]) {
            marioBG[obj.edges] = renderer;
                //marioBG[edges].getContext('2d').putImageData(ctx.getImageData(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown), defaultSide, defaultSide), 0, 0);
        }
    }

    if (obj.type == TYPE.SAVE) {

        var imageData = null;
        var data = null;

        for (var index = 0; index <= 5; index++) {

            rendererCtx.fillStyle = "black";
            rendererCtx.fillRect(0, 0, obj.width, obj.height);

            rendererCtx.fillStyle = "#995006";
            rendererCtx.fillRect(1, 1, obj.width - 2, obj.height - 2);

            rendererCtx.fillStyle = "#565656";
            rendererCtx.fillRect(1, 18, 22, 5);

            rendererCtx.fillStyle = "#060D99";
            rendererCtx.fillRect(2, 20, 4, 1);
            rendererCtx.fillRect(3, 19, 2, 3);
            rendererCtx.fillRect(18, 20, 4, 1);
            rendererCtx.fillRect(19, 19, 2, 3);

            rendererCtx.fillStyle = "white";
            rendererCtx.fillRect(2, 2, 20, 15);
            imageData = rendererCtx.getImageData(2, 2, 20, 15);
            data = imageData.data;

            for (var i = 0; i < data.length; i += 4) {
                if(Math.round(Math.random()))
                    continue;

                data[i] = 0;     // red
                data[i + 1] = 0; // green
                data[i + 2] = 0; // blue
            }
            rendererCtx.putImageData(imageData, 2, 2);
            if (!preRenderedTiles[obj.type])
                preRenderedTiles[obj.type] = [];
            
            preRenderedTiles[obj.type][index] = renderer;

            renderer = document.createElement('canvas');
            renderer.width = obj.width;
            renderer.height = obj.height;
            rendererCtx = renderer.getContext('2d');
        }
    }
}


function DrawSubTile(rendererCtx, t_x, t_y, t_w, t_h, type) {    
    switch (type) {
        case "A":
            rendererCtx.fillStyle = "#786918";
            for (var i = 0; i < 6; i++) {
                if (i == 0)
                    rendererCtx.fillStyle = "black";
                if (i == 1)
                    rendererCtx.fillStyle = "#00c901";//lightGreen
                if (i == 2)
                    rendererCtx.fillStyle = "#786918";//Brown
                if (i == 4)
                    rendererCtx.fillStyle = "#007848";//darkGreen

                rendererCtx.fillRect(t_x[i], t_y[i], t_w[i], t_h[i]);
            }
            break;
        case "B":
        case "C":
            for (var i = 0; i < 8; i++) {
                if (i == 0)
                    rendererCtx.fillStyle = "black";
                if (i == 1)
                    rendererCtx.fillStyle = "#00c901";//lightGreen
                if (i == 2)
                    rendererCtx.fillStyle = "#786918";//Brown
                if (i == 5)
                    rendererCtx.fillStyle = "#007848";//darkGreen

                rendererCtx.fillRect(t_x[i], t_y[i], t_w[i], t_h[i]);
            }
            break;
        case "D":
            for (var i = 0; i < 18; i++) {
                if (i <= 2)
                { rendererCtx.rect(t_x[i], t_y[i], t_w[i], t_h[i]); continue; }
                if (i == 3)
                { rendererCtx.rect(t_x[i], t_y[i], t_w[i], t_h[i]); rendererCtx.fill(); continue; }
                if (i == 4)
                    rendererCtx.fillStyle = "black";
                if (i == 9)
                    rendererCtx.fillStyle = "#00c901";//lightGreen
                if (i == 12)
                    rendererCtx.fillStyle = "#786918";//Brown
                if (i == 14)
                    rendererCtx.fillStyle = "#007848";//darkGreen

                rendererCtx.fillRect(t_x[i], t_y[i], t_w[i], t_h[i]);
            }
            break;
        case "E":
            for (var i = 0; i < 12; i++) {
                if (i == 0)
                    rendererCtx.fillStyle = "black";
                if (i == 2)
                    rendererCtx.fillStyle = "#00c901";//lightGreen
                if (i == 3)
                    rendererCtx.fillStyle = "#786918";//Brown
                if (i == 8)
                    rendererCtx.fillStyle = "#007848";//darkGreen

                rendererCtx.fillRect(t_x[i], t_y[i], t_w[i], t_h[i]);
            }
            break;
            break;
        default:

    }


}

function Simulation() {
    Actors[0] = new Object(TYPE.ACTOR);
    //Actors[1] = new Object(TYPE.CIRCLE);
    //Actors[1].x = (13.41*defaultWidth);//314;//484;
    //Actors[1].y = (8.58*defaultWidth);//182;//206;

    Actors[0].ResetLimbs();
    //Balls[0].speed = 0;
    txtTop.value = 0;
    var rows = template.split("\n");
    for (var i = 0, row; row = rows[i]; i++) {
        Objects[i] = [];
        for (var k = 0, col; col = row[k]; k++) {
            if (col == "X" || col == "B" || col == "R" || col == "A" || col == "G" || col == "b" ||
                col == "S" || col == "P" || col == "p" || col == "T" || col == "c" || col == "g" || col == "C" ||
                col == "╗" || col == "╝" || col == "╚" || col == "╔" || col == "D" || col == "l" || col == "t" ||
                col == "j" || col == "M" || col == "s" || col == "h" || col == "e" /*|| !isNaN(col)*/) {
                if (col != "A") {
                    var obj = new Object(getType(col));
                    obj.x = defaultSide * k;
                    obj.y = defaultSide * i;

                    if (obj.type == TYPE.CIRCLE || obj.type == TYPE.SENTRY)
                    {
                        //obj.x += obj.hRadius;
                        //obj.y += obj.vRadius;
                        obj.width = obj.hRadius;

                    }
                    else
                        obj.hRadius = 0;

                    obj.defaultY = obj.y;
                    obj.defaultX = obj.x;
                    
                    if (col == "R") {
                        obj.rotator = true;
                        obj.width = 200;
                    }
                    obj.ID = i + "-" + k;

                    //multiply columns
                    if (row[k+1] != " " && !isNaN(row[k+1])) {
                        obj.width = defaultWidth * (parseInt(row[k + 1]) + 1);
                    }

                    //multiply rows
                    if (rows[i + 1] != undefined && rows[i + 1][k] != " " && !isNaN(rows[i + 1][k])) {
                        obj.height = defaultHeight * (parseInt(rows[i + 1][k]) + 1);
                    }
                    if (obj.ID == "46-97")
                        obj.rotator = true;

                    if (obj.type == TYPE.SWITCH)
                    {
                        /*** section #1 ****/
                        if(obj.ID == "11-21")
                        {
                            obj.targetID = "10-28";
                        }

                        if(obj.ID == "7-13")
                        {                            
                            obj.targetID = "9-19";
                            obj.defaultState = true;
                            obj.pressed = obj.defaultState;                            
                        }
                        /*** section #1 ****/
                        /*** section #3 ****/
                        if (obj.ID == "11-99") {
                            obj.targetID = "11-101";
                            obj.growthMultiplier = 8;
                            obj.timed = true;
                            obj.totalTime = 500;
                        }

                        if (obj.ID == "6-107") {
                            obj.targetID = "5-110";
                            obj.growthMultiplier = 3;
                            obj.growthDirection = "L";
                            obj.timed = true;
                            obj.totalTime = 150;
                        }

                        if (obj.ID == "9-108") {
                            obj.targetID = "5-110";
                            obj.timed = true;
                        }

                        if (obj.ID == "11-93") {
                            obj.targetID = "3-99";
                            obj.growthMultiplier = 3;
                            obj.growthDirection = "R";
                            obj.timed = true;
                            obj.totalTime = 300;
                        }
                        /*** section #3 ****/
                        /*** section #5 ****/
                        if (obj.ID == "40-28") {
                            obj.targetID = "40-29";
                            obj.growthMultiplier = 8;
                            obj.growthDirection = "R";
                            obj.timed = true;
                            obj.totalTime = 120;
                            obj.growthSpeed = 2;
                        }

                        if (obj.ID == "44-41") {
                            obj.targetID = "43-49";
                            obj.growthMultiplier = 6;
                            obj.growthDirection = "L";
                            obj.timed = true;
                            obj.totalTime = 60;
                            obj.growthSpeed = 2;
                        }

                        /*** section #5 ****/


                        /*** section #7 ****/

                        if (obj.ID == "15-72") {
                            obj.targetID = "15-73";
                            obj.defaultState = true;
                            obj.pressed = obj.defaultState;
                        }

                        /*** section #7 ****/

                        /*** section #13 ****/
                        var totalTime = 60;
                        if (obj.ID == "4-237") {//1
                            obj.targetID = "6-241";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-241") {//2
                            obj.targetID = "6-246";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-246") {//3
                            obj.targetID = "6-251";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-251") {//4
                            obj.targetID = "6-256";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-256") {//5
                            obj.targetID = "6-261";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-261") {//6
                            obj.targetID = "6-266";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-266") {//7
                            obj.targetID = "6-271";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-271") {//8
                            obj.targetID = "6-276";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-276") {//9
                            obj.targetID = "6-281";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        if (obj.ID == "6-281") {//10
                            obj.targetID = "6-286";
                            obj.growthMultiplier = 3;
                            obj.timed = true;
                            obj.totalTime = totalTime;
                            obj.growthSpeed = 2;
                        }
                        /*** section #13 ****/
                    }

                    if (obj.type == TYPE.TURTLE) {
                        //if (obj.ID == "11-95") {
                        //    obj.y -= 2;
                        //    obj.height += 2;
                        //}
                        //if (obj.ID == "9-109") {
                        //    obj.y -= 2;
                        //    obj.height += 2;
                        //}
                        //if (obj.ID == "6-106") {
                        //    obj.y -= 2;
                        //    obj.height += 2;
                        //}
                        obj.y -= 2;
                        obj.height += 2;
                    }

                    if(obj.type == TYPE.CRATE)
                    {
                        obj.x += defaultWidth / 4;
                        if (obj.ID == "2-96")
                            obj.color = "green";
                    }

                    /*** section #7 ****/
                    if (obj.ID == "22-96")
                        obj.growthMultiplier = 10;
                    if (obj.ID == "25-1")
                        obj.growthMultiplier = 11;
                    if (obj.ID == "11-100")
                        obj.width += defaultWidth / 2;
                    if (obj.ID == "11-101") {
                        obj.width -= defaultWidth / 2;
                        obj.x += defaultWidth / 2;
                    }

                    /*** section #7 ****/

                    /*** section #20 ****/
                    if (obj.ID == "48-307") {
                        obj.defaultGrowerTimeOut = 20;
                        obj.growerTimeOut = 20;
                        obj.growthMultiplier = 3;
                    }
                    /*** section #20 ****/

                    if (obj.type == TYPE.BOX) {
                        obj.width = (defaultHeight/3);
                        obj.height = (defaultHeight / 3);
                        obj.vRadius = 0;
                        obj.hRadius = 0;
                        //Objects[Objects.length] = obj;
                    }

                    if (obj.type == TYPE.PLATFORM) {                        
                        obj.height = 5;
                    }

                    if (obj.type == TYPE.GLOVE || obj.type == TYPE.LIGHT || obj.type == TYPE.WALLJUMP || obj.type == TYPE.VELOCITY || obj.type == TYPE.SUPERJUMP) {
                        obj.vRadius = (defaultHeight / 10);
                        obj.hRadius = (defaultWidth / 10);
                        obj.height = (defaultHeight / 10);
                        obj.width = (defaultHeight / 10);
                        obj.x += (defaultWidth / 2);
                        obj.y += defaultHeight - obj.vRadius;
                    }

                    if (obj.type == TYPE.CRATE) {
                        obj.width = (defaultHeight / 2);
                        obj.height = (defaultHeight / 2);
                        obj.vRadius = (defaultHeight / 2);
                        obj.hRadius = 0;
                        //Objects[Objects.length] = obj;
                    }




                    Objects[i][k] = obj;
                }else
                {
                    var actor = new Object(TYPE.ACTOR);
                    actor.x = actor.width * k;
                    actor.y = actor.height * i;
                    actor.speed = 1;
                    Objects[i][k] = actor;
                }
            }
            else
                Objects[i][k] = null;
        }
    }

    worldWidth = rows[0].length * new Object(TYPE.WALL).width;
    posX.value = worldWidth;

    worldHeight = rows.length * new Object(TYPE.WALL).height;
    posY.value = worldHeight;

    //Load State
    if(localStorage.FallingSaveState != undefined)
    {
        var saveState = JSON.parse(localStorage.FallingSaveState);

        var newX = saveState.startPosition.X;
        var newY = saveState.startPosition.Y;
        Actors[0].y = (newX * defaultWidth) + Actors[0].vRadius;
        Actors[0].x = (newY * defaultHeight) + defaultWidth / 2;

        Actors[0].glove = saveState.powerUps.glove;
        Actors[0].light = saveState.powerUps.light;
        Actors[0].wallJump = saveState.powerUps.wallJump;
        Actors[0].superJump = saveState.powerUps.superJump;
        Actors[0].velocity = saveState.powerUps.velocity;

        scroller = Actors[0].x;
        moveDown = Actors[0].y - (4 * defaultHeight) > 0 ? Actors[0].y - (4 * defaultHeight) : 0;
    }
    
    var bgRows = backGround.split("\n");
    for (var i = 0, bgRow; bgRow = bgRows[i]; i++) {
        BackGround[i] = [];
        for (var k = 0, col; col = bgRow[k]; k++) {
            if(col != "X")
                continue;
            var obj = new Object(TYPE.BACKGROUND);
            obj.width = defaultWidth*2;
            obj.height = defaultHeight*2;
            obj.x = obj.width * k;
            obj.y = obj.height * i;
            obj.ID = i + "-" + k;
            BackGround[i][k] = obj;
        }
    }

    previousTime = new Date().getTime();

    for (var i = 0; i <= 100; i++) {
        var option = document.createElement("option");
        option.text = i;
        option.value = i;
        dd.add(option);

        if (i == 16) {
            dd.selectedIndex = 16;
            drawDepth = i;
        }
    }
}

//window.setInterval("Animate();", 20);//20
window.requestAnimationFrame(Animate);
var paused = false;
//var gravity = 0;
var sum = 1;
var moveDown = 0;
var scroller = 0;
var TimeSpan;
function Animate() {
    //if (!paused) {
    //    ctx.fillStyle = "aqua";//black
    //    ctx.fillRect(-10000, -10000, 20000, 20000);
    //}
    if (started) {
        if (!paused) {

            ctx.fillStyle = "aqua";//black
            ctx.fillRect(0, 0, c.width, c.height);
        }
        if (paused) {
            if (lastPausedState != paused) {
                DrawPauseScreen();
            }
            tracks[currentTrack].pause();
            return;
        }
        //checkGrower = true;

        /********************* BackGround *******************************/
        var bgSize = 4;
        var bgRow = Math.floor(((c.height / 2) + moveDown) * .5 / (defaultHeight * 2));
        var bgColumn = Math.floor(((c.width / 2) + scroller) * .5 / (defaultWidth * 2));

        var bgDrawDepthX = disableBG ? -1 : 4;//6
        var bgDrawDepthY = disableBG ? -1 : 3;//6

        var startBgRowIndex = /*bgRow - bgDrawDepthY < 0 ? 0 :*/ bgRow - bgDrawDepthY;
        var endBgRowIndex = bgRow + bgDrawDepthY;

        var startBgColIndex = /*bgColumn - bgDrawDepthX < 0 ? 0 :*/ bgColumn - bgDrawDepthX;
        var endBgColIndex = bgColumn + bgDrawDepthX;

        for (var i = startBgRowIndex; i <= endBgRowIndex; i++) {
            for (var k = startBgColIndex, obj; k <= endBgColIndex; k++) {
                var bgRowIndex = (i > 0 ? i : bgSize + i) % bgSize;
                var bgColIndex = (k > 0 ? k : bgSize + k) % bgSize;
                obj = BackGround[bgRowIndex][bgColIndex];
                if (!obj)
                    continue;

                obj.bgOffSetX = ((Math.floor(k / bgSize) * (defaultWidth * 2) * bgSize)) + (obj.width * 2);
                obj.bgOffSetY = ((Math.floor(i / bgSize) * (defaultHeight * 2) * bgSize)) + (obj.height);
                obj.Draw();
            }
        }
        /********************* BackGround *******************************/

        for (var i = 0; i < Actors.length; i++) {

            Actors[i].Move();

            lastPausedState = paused;
            if (saveScreen)
                saveScreen.Draw();
            Actors[i].Draw();
            

        }

        //checkGrower = false;

        //framerate independent
        currentTime = new Date().getTime();
        deltaTime = currentTime - previousTime;
        //deltaTime = 20;

        if (ticks % 50 == 0) {
            dt.value = deltaTime;
        }

        //var ballRow = Math.ceil(Actors[0].y / defaultSide);
        //var ballColumn = Math.ceil(Actors[0].x / defaultSide);

        var ballColumn = Math.floor(((c.width / 2) + scroller) / defaultSide);
        var ballRow = Math.floor(((c.height / 2) + moveDown) / defaultSide);

        //var drawDepth = drawDepth;//dd.options[dd.selectedIndex].value;//17;

        var startRowIndex = ballRow - drawDepth < 0 ? 0 : ballRow - drawDepth;
        var endRowIndex = ballRow + drawDepth > Objects.length ? Objects.length : ballRow + drawDepth;

        var startColIndex = ballColumn - drawDepth < 0 ? 0 : ballColumn - drawDepth;
        var endColIndex = ballColumn + drawDepth > Objects[0].length ? Objects[0].length : ballColumn + drawDepth;

        saveScreen = null;
        //this.y += this.gravity;
        for (var i = startRowIndex; i < endRowIndex; i++) {
            for (var k = startColIndex, obj; k < endColIndex; k++) {
                obj = Objects[i][k];
                if (!obj)
                    continue;

                if (obj.type == TYPE.MARIO && obj.edges < 0) {
                    obj.edges = SetMARIOEdges(i, k);
                }

                if (obj.type == TYPE.SAVE) {
                    if (saveScreen != obj) {
                        saveScreen = obj;
                    }
                }

                obj.Move();
                if (!disableDraw) {
                    if (obj.type != TYPE.DARKNESS && obj.type != TYPE.SAVE)
                        obj.Draw();
                    
                    if (obj.type == TYPE.DARKNESS)
                        darknessBuffer[darknessBuffer.length] = obj;

                    if (obj.type == TYPE.SWITCH)
                        switchBuffer[switchBuffer.length] = obj;
                }
            }
        }
        if (!disableDraw) {
            for (var i = 0; i < darknessBuffer.length; i++) {
                darknessBuffer[i].Draw();
            }

            for (var i = 0; i < switchBuffer.length; i++) {
                switchBuffer[i].Draw(true);
            }
        }

        darknessBuffer = [];
        switchBuffer = [];

        HUD();

        if (saveScreen && !saveScreen.stateSaved) {
            var fallingSaveState = null;
            if (localStorage.FallingSaveState)
                fallingSaveState = JSON.parse(localStorage.FallingSaveState);

            if (fallingSaveState && fallingSaveState.saveStations.indexOf(saveScreen.ID) != -1 && fallingSaveState && fallingSaveState.screen.src) {
                saveScreen.stateSaved = true;
                showScreen = true;
                var img = new Image();
                img.src = fallingSaveState.screen.src;
                saveScreen.screen = img;
            }
        }

        if (saveScreen && showScreen) {
            if (!saveScreen.stateSaved) {
                var img = new Image();
                var renderer = document.createElement('canvas');
                renderer.width = defaultSide;
                renderer.height = defaultSide;
                var rendererCtx = renderer.getContext('2d');
                rendererCtx.drawImage(c, 2, 2, c.width / 16, c.height / 16);
                img.src = renderer.toDataURL("image/png");
                saveScreen.screen = img;
            }
        }

        if (saveScreen)
        {
            if (!saveScreen.glow)
                saveScreen.glow = 1;
            if (!saveScreen.glowIndex)
                saveScreen.glowIndex = 31;

            if (ticks % 2 == 0)
                saveScreen.glowIndex += saveScreen.glow;

            //ctxShadow.arc(Math.ceil(saveScreen.x - scroller) + (defaultSide / 2) - (this.x - scroller) - ctxShadow.shadowOffsetX, Math.ceil(saveScreen.y - moveDown) + (defaultSide / 2) - Math.ceil(this.y - moveDown), saveScreen.glowIndex, 0, 2 * Math.PI);

            if (saveScreen.glowIndex < 30 || saveScreen.glowIndex > 40) {
                if (saveScreen.glowIndex < 30)
                    saveScreen.glowIndex = 30;

                if (saveScreen.glowIndex > 40)
                    saveScreen.glowIndex = 40;

                saveScreen.glow = saveScreen.glow * -1;
            }
        }

        previousTime = currentTime;

        spd1.value = Actors[0].gravity;

        if (tracks[currentTrack].paused) {
            tracks[currentTrack].currentTime = trackLoop[currentTrack];
            tracks[currentTrack].play();
        }

        if (!paused) {
            ticks++;

        }

        if (ticks > 1000000)
            ticks = 0;

        var d = new Date();
        if (ticks % 20 == 0)
            fps.value = Math.round(1000 / ((TimeSpan - d.getTime()) * -1));
        TimeSpan = d.getTime();



        direct.value = direction;
        tg.value = Actors[0].touchingGround;
        ActorY.value = Actors[0].y;
        ActorX.value = Actors[0].x;
        jmp.value = Actors[0].jump;

        


    }
    else
        ShowTitle();

    if (getParameterByName('debug'))
        document.getElementsByClassName("debug")[0].style.display = "";
    else
        document.getElementsByClassName("debug")[0].style.display = "none";

    window.requestAnimationFrame(Animate);
}

function SetMARIOEdges(i,k)
{
    var edges = "";

    edges += Objects[i - 1][k + 0] && Objects[i - 1][k + 0].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i - 1][k + 1] && Objects[i - 1][k + 1].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i - 0][k + 1] && Objects[i - 0][k + 1].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i + 1][k + 1] && Objects[i + 1][k + 1].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i + 1][k + 0] && Objects[i + 1][k + 0].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i + 1][k - 1] && Objects[i + 1][k - 1].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i - 0][k - 1] && Objects[i - 0][k - 1].type == TYPE.MARIO ? "0" : "1";
    edges += Objects[i - 1][k - 1] && Objects[i - 1][k - 1].type == TYPE.MARIO ? "0" : "1";

    return parseInt(edges, 2);
}

function DrawPauseScreen(changeVolume)
{
    if (!changeVolume) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("PAUSED", (c.width / 2) - 37, (c.height / 2));
        lastPausedState = paused;
        ctx.font = "10px Arial";
        ctx.fillText("Music Volume: ", (c.width / 2) - 50, (c.height / 2) + 20);
    }
    ctx.fillStyle = "white";
    ctx.fillRect((c.width / 2) + 20 - 1, (c.height / 2) + 15 - 1, 30 + 2, 5 + 2);
    ctx.fillStyle = "black";
    ctx.fillRect((c.width / 2) + 20, (c.height / 2) + 15, 30, 5);
    ctx.fillStyle = "white";
    ctx.fillRect((c.width / 2) + 20, (c.height / 2) + 15, tracks[currentTrack].volume * 30, 5);
}

function ShowTitle()
{
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.closePath();

    ctx.beginPath();

    ctx.lineWidth = 2;

    var tittleXOffSet = 10;
    var tittleYOffSet = 60;
    ctx.strokeStyle = 'white';

    //F
    ctx.moveTo(20 + tittleXOffSet, 20 + tittleYOffSet);
    ctx.lineTo(53 + tittleXOffSet, 17 + tittleYOffSet);
    ctx.lineTo(54 + tittleXOffSet, 29 + tittleYOffSet);
    ctx.lineTo(32 + tittleXOffSet, 27 + tittleYOffSet);
    ctx.lineTo(34 + tittleXOffSet, 42 + tittleYOffSet);
    ctx.lineTo(48 + tittleXOffSet, 40 + tittleYOffSet);
    ctx.lineTo(50 + tittleXOffSet, 54 + tittleYOffSet);
    ctx.lineTo(31 + tittleXOffSet, 52 + tittleYOffSet);
    ctx.lineTo(33 + tittleXOffSet, 69 + tittleYOffSet);
    ctx.lineTo(19 + tittleXOffSet, 67 + tittleYOffSet);
    ctx.lineTo(20 + tittleXOffSet, 20 + tittleYOffSet);

    //a
    ctx.moveTo(20 + 60, 20 + 70);
    ctx.lineTo(52 + 60, 18 + 70);
    ctx.lineTo(48 + 60, 57 + 70);
    ctx.lineTo(22 + 60, 60 + 70);
    ctx.lineTo(18 + 60, 43 + 70);
    ctx.lineTo(42 + 60, 39 + 70);
    ctx.lineTo(37 + 60, 29 + 70);
    ctx.lineTo(19 + 60, 32 + 70);
    ctx.lineTo(20 + 60, 20 + 70);

    //l
    ctx.moveTo(20 + 110, 20 + 70);
    ctx.lineTo(32 + 110, 18 + 70);
    ctx.lineTo(31 + 110, 57 + 70);
    ctx.lineTo(18 + 110, 62 + 70);
    ctx.lineTo(20 + 110, 20 + 70);

    //l                     
    ctx.moveTo(20 + 140, 20 + 70);
    ctx.lineTo(32 + 140, 18 + 70);
    ctx.lineTo(31 + 140, 57 + 70);
    ctx.lineTo(18 + 140, 62 + 70);
    ctx.lineTo(20 + 140, 20 + 70);

    //i                     
    ctx.moveTo(20 + 165, 20 + 90);
    ctx.lineTo(32 + 165, 18 + 90);
    ctx.lineTo(31 + 165, 42 + 90);
    ctx.lineTo(18 + 165, 44 + 90);
    ctx.lineTo(20 + 165, 20 + 90);

    //n
    ctx.moveTo(20 + 190, 20 + 82);
    ctx.lineTo(49 + 190, 52 + 82);
    ctx.lineTo(41 + 190, 49 + 82);
    ctx.lineTo(28 + 190, 42 + 82);
    ctx.lineTo(31 + 190, 51 + 82);
    ctx.lineTo(19 + 190, 49 + 82);
    ctx.lineTo(20 + 190, 20 + 82);

    //g
    ctx.moveTo(20 + 230, 20 + 90);
    ctx.lineTo(51 + 230, 19 + 90);
    ctx.lineTo(48 + 230, 59 + 90);
    ctx.lineTo(18 + 230, 61 + 90);
    ctx.lineTo(21 + 230, 52 + 90);
    ctx.lineTo(39 + 230, 50 + 90);
    ctx.lineTo(41 + 230, 41 + 90);
    ctx.lineTo(19 + 230, 38 + 90);
    ctx.lineTo(20 + 230, 20 + 90);

    ctx.stroke();

    
    
    
    if(fadeIn)
        blinkText += 1;
    else
        blinkText -= 1;

    if (blinkText >= 100)
        fadeIn = false;

    if (blinkText <= 0)
        fadeIn = true;

    ctx.font = "10px Arial";
    ctx.fillStyle = "rgba(255,255,255," + blinkText / 100 + ")";
    ctx.fillText("Press any key...", 120, 180);

    if (tracks[0].paused) {
        tracks[0].play();
    }

}


var intTop = 0;
function Object(t) {
    this.ctx = ctx;
    this.type = t;
    this.width = t == TYPE.ACTOR ? defaultWidth / 6 : defaultWidth/*c.width - 20; 50 + (Math.random() * 50)*/;
    this.x = 40;//t == TYPE.CIRCLE || t == TYPE.BOUNCER ? 50 : 0;//(Math.random() * c.width)-this.width;
    this.y = 40;//t == TYPE.CIRCLE || t == TYPE.BOUNCER ? 50 : 0;//Math.random() * c.height;
    this.speed = t == TYPE.CIRCLE ? 2 : 0;
    this.height = t == TYPE.ACTOR ? (defaultHeight/1.5) : defaultHeight;
    this.rotator = false;
    this.rotation = 0;
    this.running = false;
    this.falling = false;
    this.touchingGround = false;
    this.defaultY = 0;
    this.lifter = null;
    this.pressed = false;
    this.targetID = "";
    this.active = false;
    this.jump = 0;
    this.jumpPressed = 0;
    this.pushing = false;
    this.gravity = 0;
    this.actor = null;
    this.lastFloor = null;
    this.growthMultiplier = 2;
    this.growthDirection = "U";
    this.timer = 0;
    this.totalTime = 600;
    this.timed = false;
    this.lastY = 0;
    this.lastX = 0;
    this.lifting = false;
    this.growthSpeed = (defaultHeight / 50);
    this.lift = false;
    this.light = false;
    this.glove = false;
    this.wallJump = false;
    this.velocity = false;
    this.superJump = false;
    this.growing = undefined;
    this.additionalSpeed = 0;
    this.bgOffSetX = 0;
    this.bgOffSetY = 0;    
    this.defaultGrowerTimeOut = 50;
    this.growerTimeOut = this.defaultGrowerTimeOut;
    this.wallSlide = false;
    this.maxSpeed = 2.1;
    this.accel = 0;
    this.maxJump = -2.8;
    this.neckAngle = 270;
    this.lastWallSlide = this.wallSlide;
    this.tempWallSlide = false;
    this.friction = .5;
    this.edges = -1;
    this.animationIndexes = [0];
    this.animationIndex = 0;
    this.screen = null;
    this.searchDepth = t == TYPE.ACTOR ? 15 : 10;
    this.saveTuning = 2;
    this.stateSaved = false;
    this.moving = false;
    this.defaultState = false;

    this.ResetLimbs = function () {
        if (this.falling) {
            if (this.wallSlide) {
                /**** arms ***/
                this.angleLeftElbow = 120.0;/*red*/
                this.angleLeftHand = 160.0;
                this.angleRightElbow = 350.0;/*blue*/
                this.angleRightHand = 290.0;
                this.bounceLeftElbow = 10;
                this.bounceLeftHand = 10;
                this.bounceRightElbow = -10;
                this.bounceRightHand = -10;
                /**** arms ****/
                /**** legs ****/
                this.angleLeftKnee = 100.0;
                this.angleLeftFoot = 10.0;
                this.angleRightKnee = 80.0;
                this.angleRightFoot = 60.0;
                this.bounceLeftKnee = 10;
                this.bounceLeftFoot = 20;
                this.bounceRightKnee = -10;
                this.bounceRightFoot = -20;
                /**** legs ****/
            } else {
                /**** arms ***/
                this.angleLeftElbow = -45.0;
                this.angleLeftHand = 225.0;
                this.angleRightElbow = -45.0;
                this.angleRightHand = 225.0;
                /**** arms ****/
                /**** legs ****/
                this.angleLeftKnee = 80.0;
                this.angleLeftFoot = 100.0;
                this.angleRightKnee = 45.0;
                this.angleRightFoot = 135.0;
                /**** legs ****/
            }
        }
        else if (this.running) {
            /**** arms ***/
            this.angleLeftElbow = 90.0;
            this.angleLeftHand = -15.0;
            this.angleRightElbow = 90.0;
            this.angleRightHand = -15.0;
            this.bounceLeftElbow = 10;
            this.bounceLeftHand = 10;
            this.bounceRightElbow = -10;
            this.bounceRightHand = -10;
            /**** arms ****/
            /**** legs ****/
            this.angleLeftKnee = 70.0;
            this.angleLeftFoot = 130.0;
            this.angleRightKnee = 70.0;
            this.angleRightFoot = 130.0;
            this.bounceLeftKnee = 10;
            this.bounceLeftFoot = 20;
            this.bounceRightKnee = -10;
            this.bounceRightFoot = -20;
            /**** legs ****/
        }
        else {
            /**** arms ***/
            this.angleLeftElbow = 100.0;
            this.angleLeftHand = 80.0;
            this.angleRightElbow = 100.0;
            this.angleRightHand = 80.0;
            /**** arms ****/
            /**** legs ****/
            this.angleLeftKnee = 80.0;
            this.angleLeftFoot = 100.0;
            this.angleRightKnee = 80.0;
            this.angleRightFoot = 100.0;
            /**** legs ****/
        }
    };

    var cl = "black";
    switch (t) {
        case TYPE.CIRCLE:
        case TYPE.WALL:
            cl = "black";
            break;
        case TYPE.BOUNCER:
            cl = "red";
            break;
        case TYPE.GROWER:
            cl = "black";
            break;
        case TYPE.BOX:
            cl = "gray";
            break;
        case TYPE.CRATE:
            cl = "Olive";
            break;
        case TYPE.LIGHT:
            cl = "white";
            break;
        case TYPE.GLOVE:
            cl = "orange";
            break;
        case TYPE.WALLJUMP:
            cl = "green";
            break;
        case TYPE.BACKGROUND:
            cl = "lightBlue";
            break;
        case TYPE.VELOCITY:
            cl = "pink";
            break;
        case TYPE.SUPERJUMP:
            cl = "brown";
            break;
        case TYPE.SENTRY:
            cl = "#54A6BF";
            break;
        default:
            cl = "black";
            break;
    }
    this.color = cl;
    this.vRadius = (defaultHeight / 2.4);
    this.hRadius = (defaultWidth / (this.type == TYPE.ACTOR ? 6 : 2.4));
    this.width = this.type == TYPE.CIRCLE ? this.hRadius : this.width;
    this.ID = "";



    this.Move = function Move() {

        if (paused)
            return;



        if (this.type == TYPE.CIRCLE || this.type == TYPE.ACTOR || this.type == TYPE.BOX || this.type == TYPE.CRATE) {

            if (this.type == TYPE.ACTOR || this.type == TYPE.CRATE) {
                /*if ((this.jumpPressed && this.jump != 0) ||
                    (!this.jumpPressed && this.jump != 0))*/


                if (this.running) {
                    this.accel = this.touchingGround ? .2 : .1;
                    if (direction == "R") {
                        if (this.speed + this.accel < this.maxSpeed)
                            this.speed += this.accel;
                        else
                            this.speed = this.maxSpeed
                    } else {
                        if (this.speed - this.accel > -this.maxSpeed)
                            this.speed -= this.accel;
                        else
                            this.speed = -this.maxSpeed;
                    }
                } else {
                    this.friction = (this.touchingGround ? .4 : .075);
                    if (direction == "R") {
                        if (this.speed - this.friction > 0)
                            this.speed -= this.friction;
                        else
                            this.speed = 0;
                    } else {
                        if (this.speed + this.friction < 0)
                            this.speed += this.friction;
                        else
                            this.speed = 0;
                    }
                }

                if (this.jump != 0) {

                    if (this.jump >= this.maxJump && this.jumpPressed)
                        this.jump -= 0.75;
                    else {
                        this.gravity = this.jump;
                        this.jump = 0;
                        if (this.lastFloor)
                            this.lastFloor.lifting = false;
                        //this.lastFloor = null;

                        if(this.wallSlide)
                        {
                            if (direction == "R")
                                this.speed = -.5;
                            else
                                this.speed = .5;
                        }
                    }
                }
            }


            
            var deltaTimeDivider = 20;

            var totalGravity = this.gravity ;//* (deltaTime / deltaTimeDivider);

            /***** gravity *****/
            if(this.wallSlide)
            {
                if (this.gravity > 1)
                    this.gravity = .5;
            }

            this.y += totalGravity;
            /***** gravity *****/

            /************** speed ****************/
            //if(running)
            if (!this.pushing) {
                if (this.type == TYPE.ACTOR) {
                    if (this.speed != 0)
                        this.x += this.speed;//* (deltaTime / deltaTimeDivider);
                } else
                    this.x += this.speed;//* (deltaTime / deltaTimeDivider);

                this.x += this.additionalSpeed;
            }
            this.pushing = false;
            /************** speed ****************/

            this.touchingGround = false;
            this.additionalSpeed = 0;
            
            this.lastWallSlide = this.wallSlide;
            this.tempWallSlide = false;
            this.wallSlide = false;

            /********** collisions ************/
            var colliders = this.CheckCollisions();

            var xDiff = Math.abs(this.x - this.lastX);
            var yDiff = Math.abs(this.y - this.lastY);
            if (xDiff > yDiff)
                colliders.sort(function (a, b) { return a[2].localeCompare(b[2]); });
            else
                colliders.sort(function (a, b) { return b[2].localeCompare(a[2]); });

            var collidedV = false;
            var collidedH = false;

            for (var i = 0, collider; collider = colliders[i]; i++) {
                var obj = collider[0];

                if (collider[2] == "H" && !collidedH) {
                    ProcessBounceSides(this, obj);
                    collidedH = true;
                }

                if (collider[2] == "V" && !collidedV) {
                    ProcessBounceFloor(this, obj);
                    collidedV = true;
                }
            }
            /********** collisions ************/

            this.UpdateGrowers();

            /*if (this.lastWallSlide && this.x == this.lastX && this.tempWallSlide)
                this.wallSlide = true;*/

            if (this.lastWallSlide && this.wallSlide != this.lastWallSlide)
                this.ResetLimbs();

            this.gravity += gravityForce / (this.superJump ? 2 : 1);//0.18

            if (this.gravity > 5)
                this.gravity = 5;

            txtTop.value = Actors[0].speed;

            if (this.type == TYPE.ACTOR) {

                if (!camera.fixed) {
                    camera.x = this.x;
                    camera.y = this.y;

                    var difX = (c.width / 2);
                    if (this.speed >= this.maxSpeed)
                        difX = (c.width / 4);
                    else if (this.speed <= -this.maxSpeed)
                        difX = (c.width / 4) * 3;
                    if (((this.x - scroller > (c.width / 5) * 3) ||
                        (this.x - scroller < (c.width / 5) * 2 /*|| this.lifter*/)) || this.moving) {
                        //Scroll left-right
                        if (this.x > difX) {
                            if (this.x < (worldWidth) - this.hRadius) {
                                if (Math.abs(scroller - (this.x - difX)) > this.maxSpeed) {
                                    scroller -= (scroller - (this.x - difX)) * .05;//.05
                                    this.moving = true;
                                }
                                else {
                                    scroller = (this.x - difX);
                                    this.moving = false;
                                }

                                if (scroller > (worldWidth / 2) + ((worldWidth - (c.width * 2)) / 2))
                                    scroller = Math.ceil(worldWidth / 2) + Math.ceil((worldWidth - (c.width * 2)) / 2);
                            }
                            else
                                scroller = Math.ceil(worldWidth / 2) - this.hRadius;
                        }
                        else {
                            if (scroller <= 2)
                                scroller = 0;
                            else
                                scroller = scroller * .9;
                        }
                    }

                    //Scroll up-down
                    if ((this.y - moveDown > (c.height / 3) * 2 && this.gravity > 0) ||
                        (this.y - moveDown < (c.height / 3) && (this.gravity < .2 /*|| this.lifter*/))) {
                        if (this.y < (worldHeight) - this.vRadius) {
                            var difY = 0;
                            if (this.gravity > 0 && this.y - moveDown > (c.height / 3) * 2)
                                difY = ((c.height / 3) * 2);
                            else
                                difY = ((c.height / 3));

                            if (Math.abs(moveDown - Math.ceil(this.y - difY)) > 1)
                                moveDown -= (moveDown - Math.ceil(this.y - difY)) * .08;
                            else
                                moveDown = Math.ceil(this.y - difY);

                            if (moveDown > (worldHeight / 2) + ((worldHeight - (c.height * 2)) / 2))
                                moveDown = Math.ceil(worldHeight / 2) + Math.ceil((worldHeight - (c.height * 2)) / 2);

                        }
                        else
                            moveDown = Math.ceil(worldHeight / 2) - this.vRadius;
                    }

                    if (moveDown < 0)
                        moveDown = 0;
                    /*else
                        moveDown = 0;*/
                }
                else
                {
                    //scroller = (camera.x - (c.width / 2));
                    if (Math.abs(scroller - (camera.x - (c.width / 2))) > 1)
                        scroller -= (scroller - (camera.x - (c.width / 2))) * .05;
                    else 
                        scroller = (camera.x - (c.width / 2));


                    //moveDown = Math.ceil(camera.y - (c.height / 2));
                    if (Math.abs(moveDown - Math.ceil(camera.y - (c.height / 2))) > 1)
                        moveDown -= (moveDown - Math.ceil(camera.y - (c.height / 2))) * .08;
                    else
                        moveDown = Math.ceil(camera.y - (c.height / 2));
                }
            }

            this.lastY = this.y;
            this.lastX = this.x;

        }
        
        if (this.type == TYPE.SWITCH) {
            obj = this;
            var target = null;
            if (obj.targetID) {
                target = Objects[obj.targetID.split("-")[0]][obj.targetID.split("-")[1]];                
                target.growthSpeed = obj.growthSpeed;
                if (obj.pressed) {
                    switch (obj.growthDirection) {
                        case "U":
                            if (target.height < defaultHeight * obj.growthMultiplier) {
                                target.y -= obj.growthSpeed;//0.2;//0.1;
                                target.height += obj.growthSpeed;//0.2;//0.1;
                            }
                            break;
                        case "D":
                            if (target.height < defaultHeight * obj.growthMultiplier) {
                                target.height += obj.growthSpeed;//0.2;//0.1;
                            }
                            break;
                        case "L":
                            target.growing = undefined;
                            if (target.width < defaultWidth * obj.growthMultiplier) {
                                target.width += obj.growthSpeed;//0.2;//0.1;
                                target.x -= obj.growthSpeed;
                                target.growing = false;
                            }
                            break;
                        case "R":
                            target.growing = undefined;
                            if (target.width < defaultWidth * obj.growthMultiplier) {
                                target.width += obj.growthSpeed;//0.2;//0.1;
                                target.growing = true;
                            }
                            break;
                    }
                }
                else {
                    switch (obj.growthDirection) {
                        case "U":
                            if (target.y + obj.growthSpeed < target.defaultY)
                                target.y += obj.growthSpeed;
                            else
                                target.y = target.defaultY;

                            if (target.height - obj.growthSpeed > defaultHeight)
                                target.height -= obj.growthSpeed;
                            else
                                target.height = defaultHeight;
                            break;
                        case "D":
                            if (target.height - obj.growthSpeed > defaultHeight)
                                target.height -= obj.growthSpeed;
                            else
                                target.height = defaultHeight;
                            break;
                        case "L":
                            if (target.x + obj.growthSpeed < target.defaultX)
                                target.x += obj.growthSpeed;
                            else
                                target.x = target.defaultX;

                            if (target.width - obj.growthSpeed > defaultWidth){
                                target.width -= obj.growthSpeed;
                                target.growing = true;
                                }
                            else
                            {
                                target.width = defaultWidth;
                                target.growing = undefined;
                            }
                            break;
                        case "R":
                            if (target.width - obj.growthSpeed > defaultWidth){
                                target.width -= obj.growthSpeed;
                                target.growing = false;
                                }
                            else
                            {
                                target.width = defaultWidth;
                                target.growing = undefined;
                                }
                                        
                            break;
                    }
                }
                if(target)
                {
                    target.lift = target.height > defaultHeight;
                }
            }
            if (obj.timed && obj.pressed != obj.defaultState) {
                if (ticks > obj.timer) {
                    if (ticks - obj.timer >= obj.totalTime)
                        obj.pressed = obj.defaultState;
                }
                else {
                    var timeOffSet = 1000000 - obj.timer;
                    if (ticks >= (obj.totalTime - timeOffSet))
                        obj.pressed = !obj.defaultState;
                }
            }

        }
        /*else
            this.y -= moveDown;*/
        g.value = scroller;
        if (!this.falling && !this.touchingGround) {

            this.falling = !this.touchingGround;
            this.ResetLimbs();
        }
        md.value = moveDown;
    };
    this.CheckCollisions = function () {
        if (this.type == TYPE.ACTOR)
            showScreen = false;

        var collider = this;
        var collidedList = [];
        growers = [];
        var ballRow = Math.ceil(collider.y / new Object().height);
        var ballColumn = Math.ceil(collider.x / new Object().width);

        //var searchDepth = this.searchDepth;

        var startRowIndex = ballRow - this.searchDepth < 0 ? 0 : ballRow - this.searchDepth;
        var endRowIndex = ballRow + this.searchDepth > Objects.length ? Objects.length : ballRow + this.searchDepth;

        var startColIndex = ballColumn - this.searchDepth < 0 ? 0 : ballColumn - this.searchDepth;
        var endColIndex = ballColumn + this.searchDepth > Objects[0].length ? Objects[0].length : ballColumn + this.searchDepth;

        ri.value = startRowIndex + " - " + endRowIndex;
        ci.value = startColIndex + " - " + endColIndex;

        for (var i = startRowIndex; i < endRowIndex; i++) {
            for (var k = startColIndex, obj; k < endColIndex; k++) {
                obj = Objects[i][k];
                if (!obj || obj.type == TYPE.TUNNEL || obj.type == TYPE.DARKNESS || obj == collider)
                    continue;
                //Collisions
                // Collision y
                var bounceVertical = CheckBounceFloor(collider, obj);
                if (bounceVertical) {
                    if (obj.type != TYPE.SAVE)
                        collidedList[collidedList.length] = bounceVertical;
                    else
                        showScreen = true;
                }

                //if (obj.type == TYPE.SAVE)
                //    continue;

                // Collision x
                var bounceHorizontal = CheckBounceSides(collider, obj);
                if (bounceHorizontal) {
                    if (obj.type != TYPE.SAVE)
                        collidedList[collidedList.length] = bounceHorizontal;
                    else {
                        showScreen = true;
                        continue;
                    }

                    if (this.speed > 0 && this.speed > 0.5)
                        this.speed = 0.5;

                    if (this.speed < 0 && this.speed < -0.5)
                        this.speed = -0.5;
                }

                if (obj.type == TYPE.GROWER)
                    growers[growers.length] = obj;

            }
        }
        return collidedList;
    };
    this.UpdateGrowers = function () {
        for (var i = 0, obj; obj = growers[i]; i++) {
            if (obj.height == defaultHeight || obj.lifting)
                continue;

            obj.growerTimeOut = obj.defaultGrowerTimeOut;
            if (obj.y + 1 < obj.defaultY)
                obj.y += 1;
            else
                obj.y = obj.defaultY;

            if (obj.height - 1 > defaultHeight)
                obj.height -= 1;
            else
                obj.height = defaultHeight;
        }
    };
    this.Draw = function Draw(secondPass) {
        switch (this.type) {
            case TYPE.CIRCLE:
            case TYPE.GLOVE:
            case TYPE.LIGHT:
            case TYPE.WALLJUMP:
            case TYPE.SUPERJUMP:
            case TYPE.VELOCITY:
            case TYPE.SENTRY:
                ctx.beginPath();
                ctx.arc(this.x - scroller, (this.y - moveDown), this.hRadius, 0, 2 * Math.PI); //1
                ctx.fillStyle = this.color;
                ctx.fill();
                if (this.type == TYPE.SENTRY) {
                    ctx.strokeStyle = "#407B95";
                    ctx.stroke();
                }

                break;
            case TYPE.BOX:
                ctx.fillStyle = this.color;
                ctx.fillRect(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown), this.width, this.height);
                break;
            case TYPE.DARKNESS:
                var grd = null;
                var points = { x: Actors[0].x, y: Actors[0].y };
                shadow.width = this.width;
                shadow.height = this.height;
                ctxShadow.fillStyle = "black";
                ctxShadow.fillRect(0, 0, this.width, this.height);
                ctxShadow.shadowBlur = 60;
                ctxShadow.shadowColor = "yellow";
                ctxShadow.shadowOffsetX = 20000;
                ctxShadow.globalCompositeOperation = "xor";
                ctxShadow.beginPath();                
                ctxShadow.arc(Math.ceil(points.x - scroller) - (this.x - scroller) - ctxShadow.shadowOffsetX, Math.ceil(points.y - moveDown) - Math.ceil(this.y - moveDown), 40, 0, 2 * Math.PI);                
                if (saveScreen) {
                    ctxShadow.arc(Math.ceil(saveScreen.x - scroller) + (defaultSide / 2) - (this.x - scroller) - ctxShadow.shadowOffsetX, Math.ceil(saveScreen.y - moveDown) + (defaultSide / 2) - Math.ceil(this.y - moveDown), saveScreen.glowIndex, 0, 2 * Math.PI);
                }
                ctxShadow.fill();
                ctx.drawImage(shadow, Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));

                break;
            case TYPE.WALL:
            case TYPE.GROWER:
            case TYPE.BOUNCER:
            case TYPE.SWITCH:
            case TYPE.PILLAR:
            case TYPE.PLATFORM:
            case TYPE.TUNNEL:
            case TYPE.CRATE:
            case TYPE.TURTLE:
            case TYPE.CHECKPOINT:
                /***** OLD ******/
                //ctx.rect(this.x - scroller, (this.y - moveDown), this.width, this.height); //1
                /***** OLD ******/

                /****** NEW *******/
                ctx.fillStyle = this.color;
                if (this.rotator) {
                    ctx.save();
                    ctx.translate((this.x - scroller) + (this.width / 2), (this.y - moveDown) + (this.height / 2));
                    ctx.rotate(this.rotation * Math.PI / 180);
                    ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                } else {
                    if (!secondPass) {
                        ctx.fillRect(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown), this.width, this.height);
                        ctx.fillStyle = "grey";
                        ctx.fillRect(Math.ceil(this.x - scroller) + 1, Math.ceil(this.y - moveDown) + 1, this.width - 2, this.height - 2);
                        ctx.fillStyle = this.color;
                        ctx.fillRect(Math.ceil(this.x - scroller) + 2, Math.ceil(this.y - moveDown) + 2, this.width - 4, this.height - 4);
                    }
                    if (this.type == TYPE.SWITCH) {
                        if (this.pressed)
                            ctx.fillStyle = "lime";
                        else
                            ctx.fillStyle = "red";
                        ctx.fillRect(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown), this.width, 5);
                    }
                }
                if (this.rotator) {
                    ctx.restore();
                    if (this.rotation < 360)
                        this.rotation += 1;
                    else
                        this.rotation = 0;
                }
                /****** NEW *******/
                break;
            case TYPE.SLOPENE: //╗
            case TYPE.SLOPESE: //╝
            case TYPE.SLOPESW: //╚
            case TYPE.SLOPENW: //╔
                ctx.beginPath();
                if (this.type == TYPE.SLOPENE) {//╗
                    ctx.moveTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown) + this.height);
                    ctx.lineTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown) + this.height);
                } else if (this.type == TYPE.SLOPESE) {//╝
                    ctx.moveTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown) + this.height);
                } else if (this.type == TYPE.SLOPESW) {//╚
                    ctx.moveTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown) + this.height);
                } else if (this.type == TYPE.SLOPENW) {//╔
                    ctx.moveTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown));
                    ctx.lineTo(Math.ceil(this.x - scroller) + this.width, Math.ceil(this.y - moveDown) + this.height);
                    ctx.lineTo(Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown) + this.height);
                }

                ctx.fillStyle = this.color;
                ctx.fill();
                break;
            case TYPE.ACTOR:
                this.hipsX = (this.x - scroller);
                this.hipsY = (this.y - moveDown);
                var saved = false;
                if (this.speed <= 0) {
                    if (direction == "L") {
                        ctx.save();
                        saved = true;
                        ctx.translate((this.x - scroller) - (this.width/2), (this.y - moveDown) + (this.height / 2));
                        ctx.scale(-1, 1);
                        this.hipsX = -(this.width / 2);
                        this.hipsY = -(this.height / 2);
                    }
                }
                ctx.lineWidth = "2";
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.moveTo(this.hipsX, this.hipsY);
                this.shoulderX = this.hipsX + ComputeShoulderXPosition(this);
                this.shoulderY = this.hipsY - this.height / 2;
                ctx.lineTo(this.shoulderX, this.shoulderY);
                ctx.stroke();
                /***** head ******/
                this.neckAngle = this.NeckAngle();
                var headX = this.shoulderX + (Math.cos(((this.neckAngle * Math.PI) / 180)) * (this.height / (20 / 4)));
                var headY = this.shoulderY + (Math.sin(((this.neckAngle * Math.PI) / 180)) * (this.height / (20 / 4)));
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.arc(headX, headY, (this.height / (20 / 3)), 0, Math.PI * 2);
                ctx.stroke();
                /***** head ******/

                /********** animation *******/
                if (this.falling)
                    this.MakeStance(this);
                else if (this.running)
                    this.Run(this);
                else
                    this.MakeStance(this);                    
                if (saved) {
                    ctx.restore();
                }
                /********** animation *******/

                break;
            case TYPE.BACKGROUND:
                if (!preRenderedTiles[this.type]) {
                    var renderer = document.createElement('canvas');
                    renderer.height = renderer.width = this.width;
                    var rendererCtx = renderer.getContext('2d');
                    rendererCtx.fillStyle = this.color;
                    rendererCtx.fillRect(0, 0, this.width, this.height);
                    rendererCtx.fillStyle = "white";
                    rendererCtx.fillRect(1, 1, this.width -2, this.height -2);
                    preRenderedTiles[this.type] = [renderer];
                }
                else
                {
                    if ((Math.ceil((this.y + this.bgOffSetY) - (moveDown * .5)) > -(this.height) && Math.ceil((this.y + this.bgOffSetY) - (moveDown * .5)) < c.height) && (Math.ceil((this.x + this.bgOffSetX) - (scroller * .5)) > -(this.width) && Math.ceil((this.x + this.bgOffSetX) - (scroller * .5)) < c.width))
                        ctx.drawImage(preRenderedTiles[this.type][this.animationIndex], Math.ceil((this.x + this.bgOffSetX) - (scroller * .5)), Math.ceil((this.y + this.bgOffSetY) - (moveDown * .5)));
                }
                break;
            case TYPE.MARIO:
                if (!marioBG[this.edges])
                    PreRenderTile(this);
                else {
                    if ((Math.ceil(this.y - moveDown) > -(defaultSide) && Math.ceil(this.y - moveDown) < c.height) && (Math.ceil(this.x - scroller) > -(defaultSide) && Math.ceil(this.x - scroller) < c.width))
                        ctx.drawImage(marioBG[this.edges], Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
                }


                break;
            case TYPE.SAVE:
                if (!preRenderedTiles[this.type])
                    PreRenderTile(this);
                else {
                    if ((Math.ceil(this.y - moveDown) > -(defaultSide) && Math.ceil(this.y - moveDown) < c.height) && (Math.ceil(this.x - scroller) > -(defaultSide) && Math.ceil(this.x - scroller) < c.width))
                        this.Animate();
                }
                break;
            default:
        }
        this.DrawID();
    };

    this.Animate = function () {
        ctx.drawImage(preRenderedTiles[this.type][this.animationIndex], Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
        if (ticks % (showScreen ? this.saveTuning : 1) == 0 && !this.stateSaved) {
            if (this.animationIndex + 1 < preRenderedTiles[this.type].length)
                this.animationIndex++;
            else
                this.animationIndex = 0;
        }
        else if(this.screen){
            ctx.drawImage(this.screen, Math.ceil(this.x - scroller), Math.ceil(this.y - moveDown));
            if (this.saveTuning >= 10 && !this.stateSaved)
            {
                this.stateSaved = true;
                SaveState(this, Actors[0]);
            }
        }

        if (!this.stateSaved) {
            if (!showScreen)
                this.saveTuning = 2;
            else if (ticks % 20 == 0)
                this.saveTuning++;
        }
    }

    this.DrawID = function () {
        if (showTilesID) {
            if (this.type == TYPE.BACKGROUND) {
                ctx.font = "7px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(this.ID, Math.ceil((this.x + this.bgOffSetX) - (scroller * .5)), Math.ceil((this.y + this.bgOffSetY) - (moveDown * .5)) +10);
        }
        else {
                ctx.font = "7px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(this.ID.split('-')[0], this.x -scroller + 7, this.y +11 -moveDown);
                ctx.fillText(this.ID.split('-')[1], this.x -scroller + 7, this.y +18 -moveDown);
    }
    }
    }
this.Run = function (self) {

    var minElbow = 40; //40 //70
    var maxElbow = 140; //140 //110
    var minKnee = 20; //20 //60
    var maxKnee = 120; //120 //80

    //self.angleLeftHand = 60;//-15.0;
    //self.angleRightHand = 60;//-15.0;
    //self.bounceLeftKnee = 10 / 2;
    //self.bounceRightKnee = -10 / 2;

    //self.bounceLeftElbow = 10/2;
    //self.bounceRightElbow = -10/2;
    /********** left arm *************/
    ctx.beginPath();
    ctx.moveTo(self.shoulderX, self.shoulderY);
    ctx.strokeStyle = "red";
    var leftElbowX = self.shoulderX + (Math.cos(((self.angleLeftElbow * Math.PI) / 180)) * this.height / 4);
    var leftElbowY = self.shoulderY + (Math.sin(((self.angleLeftElbow * Math.PI) / 180)) * this.height / 4);
    ctx.lineTo(leftElbowX, leftElbowY);
    var leftHandX = leftElbowX + (Math.cos(((self.angleLeftHand * Math.PI) / 180)) * this.height / 4);
    var leftHandY = leftElbowY + (Math.sin(((self.angleLeftHand * Math.PI) / 180)) * this.height / 4);
    ctx.lineTo(leftHandX, leftHandY);
    if (self.angleLeftElbow < minElbow || self.angleLeftElbow > maxElbow) {
        self.bounceLeftElbow *= -1;
        self.bounceLeftHand *= -1;
        }
        self.angleLeftElbow += self.bounceLeftElbow;
        self.angleLeftHand += self.bounceLeftHand;
    ctx.stroke();
    /********** left arm *************/
    /********** right arm *************/
    ctx.beginPath();
    ctx.moveTo(self.shoulderX, self.shoulderY);
    ctx.strokeStyle = "blue";
    var rightElbowX = self.shoulderX + (Math.cos(((self.angleRightElbow * Math.PI) / 180)) * this.height / 4);
    var rightElbowY = self.shoulderY + (Math.sin(((self.angleRightElbow * Math.PI) / 180)) * this.height / 4);
    ctx.lineTo(rightElbowX, rightElbowY);
    var rightHandX = rightElbowX + (Math.cos(((self.angleRightHand * Math.PI) / 180)) * this.height / 4);
    var rightHandY = rightElbowY + (Math.sin(((self.angleRightHand * Math.PI) / 180)) * this.height / 4);
    ctx.lineTo(rightHandX, rightHandY);
    if (self.angleRightElbow < minElbow || self.angleRightElbow > maxElbow) {
        self.bounceRightElbow *= -1;
        self.bounceRightHand *= -1;
        }
        self.angleRightElbow += self.bounceRightElbow;
        self.angleRightHand += self.bounceRightHand;
    ctx.stroke();
    /********** right arm *************/
    /********** right leg *************/
    ctx.beginPath();
    ctx.moveTo(self.hipsX, self.hipsY); //hips
    ctx.strokeStyle = "blue";
    var rightKneeX = self.hipsX + (Math.cos(((self.angleRightKnee * Math.PI) / 180)) * this.height / 3);
    var rightKneeY = self.hipsY + (Math.sin(((self.angleRightKnee * Math.PI) / 180)) * this.height / 3);
    ctx.lineTo(rightKneeX, rightKneeY);
    var rightFootX = rightKneeX + (Math.cos(((self.angleRightFoot * Math.PI) / 180)) * this.height / (10 / 3));
    var rightFootY = rightKneeY + (Math.sin(((self.angleRightFoot * Math.PI) / 180)) * this.height / (10 / 3));
    ctx.lineTo(rightFootX, rightFootY);
    if (self.angleRightKnee < minKnee || self.angleRightKnee > maxKnee) {
        self.bounceRightKnee *= -1;
        self.bounceRightFoot *= -1;
        }

        self.angleRightKnee += self.bounceRightKnee;
        if (self.bounceRightFoot > 0) {
            //this.angleRightFoot += this.bounceRightFoot/2;
            self.angleRightFoot = self.angleRightKnee +20;
        }
        else {
            //this.angleRightFoot += this.bounceRightFoot / 2;
            self.angleRightFoot = self.angleRightKnee +90;
        }
    ctx.stroke();
    /********** right leg *************/
    /********** left leg *************/
    ctx.beginPath();
    ctx.moveTo(self.hipsX, self.hipsY); //hips
    ctx.strokeStyle = "red";
    var leftKneeX = self.hipsX + (Math.cos(((self.angleLeftKnee * Math.PI) / 180)) * this.height / 3);
    var leftKneeY = self.hipsY + (Math.sin(((self.angleLeftKnee * Math.PI) / 180)) * this.height / 3);
    ctx.lineTo(leftKneeX, leftKneeY);
    var leftFootX = leftKneeX + (Math.cos(((self.angleLeftFoot * Math.PI) / 180)) * this.height / (10 / 3));
    var leftFootY = leftKneeY + (Math.sin(((self.angleLeftFoot * Math.PI) / 180)) * this.height / (10 / 3));
    ctx.lineTo(leftFootX, leftFootY);
    if (self.angleLeftKnee < minKnee || self.angleLeftKnee > maxKnee) {
        self.bounceLeftKnee *= -1;
        self.bounceLeftFoot *= -1;
        }
        self.angleLeftKnee += self.bounceLeftKnee;
        if (this.bounceLeftFoot > 0) {
            //this.angleRightFoot += this.bounceRightFoot/2;
            self.angleLeftFoot = self.angleLeftKnee +20;
        }
        else {
            //this.angleRightFoot += this.bounceRightFoot / 2;
            self.angleLeftFoot = self.angleLeftKnee +90;
        }
    ctx.stroke();
        /********** left leg *************/

};
    this.MakeStance = function (self) {

        var minElbow = 40; //40 //70
        var maxElbow = 140; //140 //110
        var minKnee = 20; //20 //60
        var maxKnee = 120; //120 //80

        //self.angleLeftHand = 90;//-15.0;
        //self.angleRightHand = 90;//-15.0;
        //self.bounceLeftKnee = 10 / 2;
        //self.bounceRightKnee = -10 / 2;

        //self.bounceLeftElbow = 10/2;
        //self.bounceRightElbow = -10/2;
        /********** left arm *************/
        ctx.beginPath();
        ctx.moveTo(self.shoulderX, self.shoulderY);
        ctx.strokeStyle = "red";
        var leftElbowX = self.shoulderX + (Math.cos(((self.angleLeftElbow * Math.PI) / 180)) * this.height / 4);
        var leftElbowY = self.shoulderY + (Math.sin(((self.angleLeftElbow * Math.PI) / 180)) * this.height / 4);
        ctx.lineTo(leftElbowX, leftElbowY);
        var leftHandX = leftElbowX + (Math.cos(((self.angleLeftHand * Math.PI) / 180)) * this.height / 4);
        var leftHandY = leftElbowY + (Math.sin(((self.angleLeftHand * Math.PI) / 180)) * this.height / 4);
        ctx.lineTo(leftHandX, leftHandY);
        /*if (self.angleLeftElbow < minElbow || self.angleLeftElbow > maxElbow) {
            self.bounceLeftElbow *= -1;
            self.bounceLeftHand *= -1;
        }
        self.angleLeftElbow += self.bounceLeftElbow;
        self.angleLeftHand += self.bounceLeftHand;*/
        ctx.stroke();
        /********** left arm *************/
        /********** right arm *************/
        ctx.beginPath();
        ctx.moveTo(self.shoulderX, self.shoulderY);
        ctx.strokeStyle = "blue";
        var rightElbowX = self.shoulderX + (Math.cos(((self.angleRightElbow * Math.PI) / 180)) * this.height / 4);
        var rightElbowY = self.shoulderY + (Math.sin(((self.angleRightElbow * Math.PI) / 180)) * this.height / 4);
        ctx.lineTo(rightElbowX, rightElbowY);
        var rightHandX = rightElbowX + (Math.cos(((self.angleRightHand * Math.PI) / 180)) * this.height / 4);
        var rightHandY = rightElbowY + (Math.sin(((self.angleRightHand * Math.PI) / 180)) * this.height / 4);
        ctx.lineTo(rightHandX, rightHandY);
        /*if (self.angleRightElbow < minElbow || self.angleRightElbow > maxElbow) {
            self.bounceRightElbow *= -1;
            self.bounceRightHand *= -1;
        }
        self.angleRightElbow += self.bounceRightElbow;
        self.angleRightHand += self.bounceRightHand;*/
        ctx.stroke();
        /********** right arm *************/
        /********** right leg *************/
        ctx.beginPath();
        ctx.moveTo(self.hipsX, self.hipsY); //hips
        ctx.strokeStyle = "blue";
        var rightKneeX = self.hipsX + (Math.cos(((self.angleRightKnee * Math.PI) / 180)) * this.height / 3);
        var rightKneeY = self.hipsY + (Math.sin(((self.angleRightKnee * Math.PI) / 180)) * this.height / 3);
        ctx.lineTo(rightKneeX, rightKneeY);
        var rightFootX = rightKneeX + (Math.cos(((self.angleRightFoot * Math.PI) / 180)) * this.height / (10 / 3));
        var rightFootY = rightKneeY + (Math.sin(((self.angleRightFoot * Math.PI) / 180)) * this.height / (10 / 3));
        ctx.lineTo(rightFootX, rightFootY);
        /*if (self.angleRightKnee < minKnee || self.angleRightKnee > maxKnee) {
            self.bounceRightKnee *= -1;
            self.bounceRightFoot *= -1;
        }

        self.angleRightKnee += self.bounceRightKnee;
        if (self.bounceRightFoot > 0) {
            //this.angleRightFoot += this.bounceRightFoot/2;
            self.angleRightFoot = self.angleRightKnee + 20;
        }
        else {
            //this.angleRightFoot += this.bounceRightFoot / 2;
            self.angleRightFoot = self.angleRightKnee + 90;
        }*/
        ctx.stroke();
        /********** right leg *************/
        /********** left leg *************/
        ctx.beginPath();
        ctx.moveTo(self.hipsX, self.hipsY); //hips
        ctx.strokeStyle = "red";
        var leftKneeX = self.hipsX + (Math.cos(((self.angleLeftKnee * Math.PI) / 180)) * this.height / 3);
        var leftKneeY = self.hipsY + (Math.sin(((self.angleLeftKnee * Math.PI) / 180)) * this.height / 3);
        ctx.lineTo(leftKneeX, leftKneeY);
        var leftFootX = leftKneeX + (Math.cos(((self.angleLeftFoot * Math.PI) / 180)) * this.height / (10 / 3));
        var leftFootY = leftKneeY + (Math.sin(((self.angleLeftFoot * Math.PI) / 180)) * this.height / (10 / 3));
        ctx.lineTo(leftFootX, leftFootY);
        /*if (self.angleLeftKnee < minKnee || self.angleLeftKnee > maxKnee) {
            self.bounceLeftKnee *= -1;
            self.bounceLeftFoot *= -1;
        }
        self.angleLeftKnee += self.bounceLeftKnee;
        if (this.bounceLeftFoot > 0) {
            //this.angleRightFoot += this.bounceRightFoot/2;
            self.angleLeftFoot = self.angleLeftKnee + 20;
        }
        else {
            //this.angleRightFoot += this.bounceRightFoot / 2;
            self.angleLeftFoot = self.angleLeftKnee + 90;
        }*/
        ctx.stroke();
        /********** left leg *************/

};
    this.bumpY = function (sphereX) {
        //╗ - 187 - SLOPENE
        //╝ - 188 - SLOPESE
        //╚ - 200 - SLOPESW
        //╔ - 201 - SLOPENW
        var tan = 0;
        var adj = 0;
        switch (this.type) {
            case TYPE.SLOPENE:
                tan = this.height / this.width;
                adj = sphereX -this.x;
                break;
            case TYPE.SLOPESE:
                    //tan = this.height / this.width;
                    //adj = this.width - sphereX;
                tan = 0;
                adj = 0;
                break;
            case TYPE.SLOPESW:
                    //tan = this.height / this.width;
                    //adj = this.width - sphereX;
                tan = 0;
                adj = 0;
                break;
            case TYPE.SLOPENW:
                tan = this.height / this.width;
                adj = (this.x + this.width) -sphereX;
                break;
            default:
                tan = 0;
                adj = 0;
        }
        var returnValue = this.y +(tan * adj);
        if (sphereX >= this.x + this.width && returnValue < this.y)
            returnValue = this.y;
        if (sphereX < this.x && returnValue > this.y +this.height)
            returnValue = this.y +this.height;
        return returnValue;
        };
    this.bumpHeight = function (sphereX) {
        //╗ - 187 - SLOPENE
        //╝ - 188 - SLOPESE
        //╚ - 200 - SLOPESW
        //╔ - 201 - SLOPENW
        var tan = 0;
        var adj = 0;
        switch (this.type) {
            case TYPE.SLOPENE:
                tan = this.height / this.width;
                adj = sphereX -this.x;
                break;
            case TYPE.SLOPESE:
                    //tan = this.height / this.width;
                    //adj = this.width - sphereX;
                tan = 0;
                adj = 0;
                break;
            case TYPE.SLOPESW:
                    //tan = this.height / this.width;
                    //adj = this.width - sphereX;
                tan = 0;
                adj = 0;
                break;
            case TYPE.SLOPENW:
                tan = this.height / this.width;
                adj = (this.x + this.width) -sphereX;
                break;
            default:
                tan = 0;
                adj = 0;
        }
        var offSet = ((tan * adj) <= this.height ? (tan * adj) : this.height);
        //var calculatedY = (this.y + offSet <= this.y + this.height ? this.y + offSet : this.y + this.height);
        //return calculatedY;
        return this.height -offSet;
        };
        function ComputeShoulderXPosition(self) {
            if (self.wallSlide)
                return - (self.height / 8);
            if (self.running)
                return self.height / 8;

        return 0;
        }
    this.NeckAngle = function () {
        if(this.wallSlide)
            return 240;
        if (this.running)
            return 290;

        return 270;

    }
}

function HUD() {
    if(Actors[0].glove)
    {
        ctx.beginPath();
        ctx.arc(20, 20, 4, 0, 2 * Math.PI); //1
        ctx.fillStyle = new Object(TYPE.GLOVE).color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    if (Actors[0].light) {
        ctx.beginPath();
        ctx.arc(30, 20, 4, 0, 2 * Math.PI); //1
        ctx.fillStyle = new Object(TYPE.LIGHT).color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    if (Actors[0].wallJump) {
        ctx.beginPath();
        ctx.arc(40, 20, 4, 0, 2 * Math.PI); //1
        ctx.fillStyle = new Object(TYPE.WALLJUMP).color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    if (Actors[0].superJump) {
        ctx.beginPath();
        ctx.arc(50, 20, 4, 0, 2 * Math.PI); //1
        ctx.fillStyle = new Object(TYPE.SUPERJUMP).color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    if (Actors[0].velocity) {
        ctx.beginPath();
        ctx.arc(60, 20, 4, 0, 2 * Math.PI); //1
        ctx.fillStyle = new Object(TYPE.VELOCITY).color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

function CheckBounceFloor(sphere, obj) {
    var width = (sphere.type == TYPE.ACTOR ? sphere.width/4 : sphere.width);
    if ((CheckBounceTop(sphere, obj) ||
        CheckBounceBotton(sphere, obj)) &&
        (Math.round(sphere.x) + width > Math.round(obj.x) && (Math.round(sphere.x)) < (obj.x + obj.width))) {
        if (CheckBounceTop(sphere, obj))
            return [obj, "T", "V"];
        else
            return [obj, "B", "V"];
    }
    return null;
}
function CheckBounceTop(active, obj) {
    return (((active.y - active.vRadius) < /*obj.y*/ obj.bumpY(active.x) && ((active.y + active.vRadius) + active.gravity) > /*obj.y*/obj.bumpY(active.x)) && (active.gravity > 0 || obj.lift));
}
function CheckBounceBotton(active, obj) {
    return ((active.y + active.vRadius) > (/*obj.y*/obj.bumpY(active.x) + obj.height) && ((active.y - active.vRadius) + active.gravity) < (/*obj.y*/obj.bumpY(active.x) + obj.height)) && active.gravity < 0;
}

function ProcessBounceFloor(actor,obj)
{
    if (obj.type == TYPE.GLOVE) {
        actor.glove = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.LIGHT) {
        actor.light = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.WALLJUMP) {
        actor.light = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.SUPERJUMP) {
        actor.superJump = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.VELOCITY) {
        actor.velocity = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }

    if (actor.gravity > -0.1 || (actor.y < obj.y && actor.y < obj.y + obj.width))
        actor.y = /*obj.y*/obj.bumpY(actor.x) - actor.vRadius;
    else
    if (actor.y + actor.vRadius > obj.y + obj.width && actor.y < obj.y + obj.width)
        actor.y = /*obj.y*/obj.bumpY(actor.x) + obj.height + actor.vRadius;

    if (obj.type == TYPE.BOUNCER) {
        if (actor.gravity > 0)
            actor.gravity += 3;
        else
            actor.gravity -= 3;

        actor.gravity = (actor.gravity * .9);
    }
    else
        actor.gravity = (actor.gravity * .001);

    //if (obj.type == TYPE.GLOVE) {
    //    Objects[i][k] = null;
    //    return;
    //}
    
    if(obj.growing != undefined)
    {
        if(obj.growing)
            actor.additionalSpeed = obj.growthSpeed;
        else
            actor.additionalSpeed = -obj.growthSpeed;
    }

    if (obj.type == TYPE.SWITCH && actor.y < obj.y) {
        if (actor.lastFloor != obj || actor.falling) {
            obj.pressed = !obj.pressed;
            if (obj.timed)
                obj.timer = ticks;//10 seconds (50 per second)
        }
        else
            obj.timer = ticks;
    }

    if (actor.gravity > 0)
        actor.lastFloor = obj;

    if (actor.lastY < actor.y) {
        if (actor.lastFloor != null && actor.lastFloor.type == TYPE.GROWER) {
            var grv = actor.y - actor.lastY;
            if (grv > actor.vRadius)
                grv = actor.vRadius
            actor.gravity -= grv;
        }
        else
            actor.gravity -= actor.falling ? Math.abs(actor.speed) : Math.abs(Math.abs(actor.lastY - actor.y));
    }



    /*if (gravity < 5)
        gravity = 5;*/
    actor.gravity *= -1;
    if (actor.falling) {
        actor.falling = false;
        actor.ResetLimbs();/*teste*/
    }
    actor.touchingGround = true;



    if (obj.type == TYPE.GROWER && (obj.height <= defaultHeight * obj.growthMultiplier /*|| obj.ID == "84-2""84-140"*/)) {
        if(obj.growerTimeOut<=0)
        {
            obj.y -= 1;//0.2;//0.1;
            obj.height += 1;//0.2;//0.1;
            obj.lifting = true;
        }
        else
            obj.growerTimeOut -= 1;
    }

    if (actor.lastFloor && actor.lastFloor.type == TYPE.GROWER && obj != actor.lastFloor)
        actor.lastFloor.lifting = false;

    //SaveState(obj, actor);

    /*** section #12 ****/
    if (actor.type == TYPE.ACTOR) {
        if (obj.ID == "48-101" || obj.ID == "11-172") {
            if (currentTrack != 3) {
                tracks[currentTrack].pause();
                tracks[currentTrack].currentTime = -1;
                currentTrack = 3;
            }
        }
        if (obj.ID == "48-100" || obj.ID == "11-171") {
            if (currentTrack != 1) {
                tracks[currentTrack].pause();
                tracks[currentTrack].currentTime = -1;
                currentTrack = 1;
            }
        }
    }

    /********** section #7  ********************/
    if (obj.ID == "23-75") {
        Objects[15][72].pressed = true;
        camera.x = 1920;
        camera.y = 445;
        camera.fixed = true;
    }
    /********** section #7  ********************/
}

function SaveState(obj, actor)
{
    var oldSaveState = localStorage.FallingSaveState ? JSON.parse(localStorage.FallingSaveState) : null;
    var saveStations = oldSaveState && oldSaveState.saveStations ? oldSaveState.saveStations : "";

    if (saveStations.indexOf(obj.ID) == -1)
    {
        saveStations += obj.ID + ",";
    }

    var saveState = {
        startPosition: { X: obj.ID.split('-')[0], Y: obj.ID.split('-')[1] },
        powerUps: {
            glove: actor.glove,
            light: actor.light,
            wallJump: actor.wallJump,
            superJump: actor.superJump,
            velocity: actor.velocity
        },
        screen: { src: obj.screen.src },
        saveStations: saveStations
    };

    

    localStorage.FallingSaveState = JSON.stringify(saveState);
    //if (obj.ID == "7-41") {
    //    localStorage.startPosition = "6-41";
    //    localStorage.powerUps = GatheredPowerUps(actor);
    //}

    if (obj.ID == "24-12") {
        localStorage.startPosition = "23-12";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    //if (obj.ID == "3-81") {
    //    localStorage.startPosition = "2-81";
    //    localStorage.powerUps = GatheredPowerUps(actor);
    //}
    

    //if (obj.ID == "48-97") {
    //    localStorage.startPosition = "47-97";
    //    localStorage.powerUps = GatheredPowerUps(actor);
    //}

    if (obj.ID == "30-78") {
        localStorage.startPosition = "29-78";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    if (obj.ID == "4-232") {
        localStorage.startPosition = "3-232";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    if (obj.ID == "34-140") {
        localStorage.startPosition = "33-140";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    if (obj.ID == "11-161") {
        localStorage.startPosition = "10-161";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    if (obj.ID == "40-18") {
        localStorage.startPosition = "39-25";
        localStorage.powerUps = GatheredPowerUps(actor);
    }

    if (obj.ID == "78-283") {
        localStorage.startPosition = "77-283";
        localStorage.powerUps = GatheredPowerUps(actor);
    }
}

function GatheredPowerUps(actor)
{
    return [actor.glove, actor.light, actor.wallJump];
}

function CheckBounceSides(sphere, obj) {
    if ((CheckBounceLeft(sphere, obj) ||
         CheckBounceRight(sphere, obj)) &&
        ((Math.round(sphere.y) + sphere.vRadius - (sphere.type == TYPE.ACTOR ? 4 : 0)) > Math.round(/*obj.y*/obj.bumpY(sphere.x)) && (Math.round(sphere.y) - sphere.vRadius) < (Math.round(/*obj.y*/obj.bumpY(sphere.x)) +/*obj.height*/obj.bumpHeight(sphere.x)))) {
        if (CheckBounceLeft(sphere, obj))
            return [obj, "L", "H"];
        else
            return [obj, "R", "H"];
    }
    return null;
}
function CheckBounceRight(active, obj) {

    return ((active.x + active.width) > obj.x + obj.width && (active.x - active.hRadius + active.speed) < obj.x + obj.width)
}
function CheckBounceLeft(active, obj) {

    return (active.x - active.hRadius < obj.x && ((active.x + active.width) + active.speed) > obj.x);
}
function ProcessBounceSides(active,obj)
{
    if (obj.type == TYPE.GLOVE) {
        active.glove = true;
        Objects[obj.ID.split("-")[0]][bj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.LIGHT) {
        active.light = true;
        Objects[obj.ID.split("-")[0]][bj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.WALLJUMP) {
        active.light = true;
        Objects[obj.ID.split("-")[0]][bj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.SUPERJUMP) {
        actor.superJump = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }
    if (obj.type == TYPE.VELOCITY) {
        actor.velocity = true;
        Objects[obj.ID.split("-")[0]][obj.ID.split("-")[1]] = null;
        return true
    }

    var pushForce = .5;
    if (obj.type == TYPE.CRATE && active.glove && active.running) {
        obj.speed = (direction == "R" ? pushForce : -pushForce);
        if (!CheckSideCollisions(obj)) {
            //active.speed = (direction == "R" ? pushForce : -pushForce);
            active.pushing = true;
            if (direction == "R") {
                obj.x += pushForce;
            }
            else {
                obj.x -= pushForce;
            }
        }
    }

    if (CheckBounceLeft(active, obj))
        active.x = obj.x - active.hRadius;
    if (CheckBounceRight(active, obj))
        active.x = obj.x + obj.width + active.hRadius;

    /**** end ******/
    if (active.type == TYPE.CIRCLE) {
        active.speed -= obj.speed;
        if (obj.type == TYPE.BOUNCER) {
            if (active.speed > 0)
                active.speed += 3;
            else
                active.speed -= 3;
        }
    }
    if (obj.type == TYPE.GLOVE) {
        Objects[i][k] = null;
        return;
    }
    if (active.type == TYPE.ACTOR) {
        active.wallSlide = active.running && active.falling && active.wallJump && active.gravity > 0;

        if (active.wallSlide)
        {
            if (direction == "R")
                active.speed = .5;
            else
                active.speed = -.5;
        }
        else if (!active.running) {
            if (direction == "R")
                active.speed = (active.speed - .4 > 0 ? active.speed - .4 : 0);
            else
                active.speed = (active.speed + .4 < 0 ? active.speed + .4 : 0);
        }
        
        

        if (active.wallSlide)
            active.ResetLimbs();
    }

    if (active.type == TYPE.CIRCLE) {
        active.speed *= -1;
        active.speed = active.speed * .7;
    }


}

function CheckSideCollisions(active) {
    var colliders = active.CheckCollisions();
    for (var i = 0, collider; collider = colliders[i]; i++) {        
        var obj = CheckBounceSides(active, collider[0]);
        if (obj)
            return true;
    }

    return false;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
