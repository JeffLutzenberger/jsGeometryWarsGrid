'use strict';
/**
 * The gameboard controller is responsible for setting up a level and managing gameplay for
 * a level
 * */
var Gameboard = function (canvas, hdim, vdim) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.grid = new GameGrid(768 * hdim, 1024 * vdim, 768, 1024);
    this.waterfall = new ParticleWorld(canvas, this.grid);
    this.editorui = new EditorUI(this.waterfall);
    this.hdim = hdim || 3;
    this.vdim = vdim || 3;
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.selectedLevel = -1;
    this.hoverLevel = -1;
    this.clickLevel = -1;
    this.levelButtons = [];
    this.zoomTime = 0;
    this.startZoomFactor = 1;
    this.finalZoomFactor = 1;
    this.zoomTransition = false;
    this.loadLevels();
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(768 * 0.5, 1025 * 0.5);
    this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.finalZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
    this.finalZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
    this.editmode = true;

    //setup ui...
    //$("#object-form").html('');
    //$("#object-form").off();


};

Gameboard.prototype = {

    setHandlers: function () {
        //$('canvas').unbind();
        //$(document).unbind();
        this.hide();
        this.editorui.show();

        //$(document).bind('opendoor', $.proxy(function (e) {
        //    console.log("open door message");
        //    //this.doorIsOpen = true;
        //}, this));


        $("#editor-toggle").append('<pre>Edit Mode: <input id="edit-mode-input" type="checkbox" value="' + this.editmode + '"></span><br></pre>');
        $("#edit-mode-input").change($.proxy(function () {
            this.editmode = $("#edit-mode-input").prop('checked');
            if (this.editmode) {
                this.editorui.show();
            } else {
                this.editorui.hide();
            }
        }, this));

        $("#edit-mode-input").prop('checked', true);

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(p.x, p.y, this.editmode);
            this.editorui.gameObjectForm.gameObject = this.waterfall.interactable;
            this.editorui.gameObjectForm.hide();
            if (this.waterfall.interactable) {
                this.editorui.gameObjectForm.show();
            } else {
                this.selectLevel(this.levelButtonHit(p.x, p.y));
            }
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            this.waterfall.interactable = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.waterfall.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            
            if (this.waterfall.interactable && this.waterfall.interactable.grabberSelected) {
                //move the sinks grabber...
                this.waterfall.interactable.moveGrabber(p);
            } else if (this.waterfall.interactable) {
                this.waterfall.interactable.setxy(p.x, p.y);
                this.editorui.gameObjectForm.updateLocation();
            }
            this.hoverLevel = this.levelButtonHit(p.x, p.y);
        }, this));

        $(document).bind('keydown', $.proxy(function (e) {
            var obj, obj2;
            //console.log(e.keyCode);
            switch (e.keyCode) {
            case 39: //right arrow
                this.moveRight();
                break;
            case 37:
                this.moveLeft();
                break;
            case 38:
                this.moveUp();
                break;
            case 40:
                this.moveDown();
                break;
            default:
                break;
            }
        }, this));


        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            console.log(e.keyCode);
            switch (e.keyCode) {
            case 45: //minus
                this.home();
                break;
            default:
                break;
            }
        }, this));

        $(document).bind('levelup', $.proxy(function (e) {
            this.home();
        }, this));
        
        this.waterfall.setHandlers();

    },

    hide: function () {
        $("#editor-toggle").html('');
        $("#editor-toggle").off();
        this.editorui.hide();
    },


    update: function (dt) {
        if (this.zoomTransition) {
            this.onZoomTransition(dt);
        }
        this.waterfall.update(dt);
        this.draw(dt);
    },

    loadLevels: function () {
        var w = 768, h = 1024, r, x, y, i, j;
        for (j = 0; j < this.vdim; j += 1) {
            for (i = 0; i < this.hdim; i += 1) {
                x = w * i;
                y = h * j;
                r = new Rectangle(x + w * 0.5, y + h * 0.5, w, h, 0);
                this.levelButtons.push(r);
            }
        }
        //level0
        //LevelLoader.load(this.waterfall, level4, 768, 1024);
        //LevelLoader.load(this.waterfall, levels[0], 768, 1024);
        //LevelLoader.load(this.waterfall, awesomelevel, 0, 0);
        //LevelLoader.addLevel(this.waterfall, level3, 768 * 2, 1024);
    },
     
    levelButtonHit: function (x, y) {
        var i = 0, p = new Particle(x, y), b;
        for (i = 0; i < this.levelButtons.length; i += 1) {
            b = this.levelButtons[i].bbHit(p);
            if (b) {
                return i;
            }
        }
        return -1;
    },

    
    selectLevel: function (i) {
        //zoom to level and enable interactabble object handlers
        var r = this.levelButtons[i];
        this.selectedLevel = i;
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(r.x, r.y);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(r.w, r.h);
        this.zoomTime = 0;
    },

    onZoomTransition: function (dt) {
        var duration = 500,
            centerDeltaX = this.finalZoomCenter.x - this.startZoomCenter.x,
            centerDeltaY = this.finalZoomCenter.y - this.startZoomCenter.y,
            extentDeltaX = this.finalZoomExtents.x - this.startZoomExtents.x,
            extentDeltaY = this.finalZoomExtents.y - this.startZoomExtents.y,
            x,
            y;
        //when this.zoomTime = duration we should be fully transitioned
        if (this.zoomTime > duration) {
            this.zoomTime = duration;
            this.zoomTransition = false;
        }
        x = this.zoomTime / duration * centerDeltaX + this.startZoomCenter.x;
        y = this.zoomTime / duration * centerDeltaY + this.startZoomCenter.y;
        this.camera.setCenter(x, y);
        x = this.zoomTime / duration * extentDeltaX + this.startZoomExtents.x;
        y = this.zoomTime / duration * extentDeltaY + this.startZoomExtents.y;
        this.camera.setExtents(x, y);
        this.zoomTime += dt;
    },

    home: function () {
        this.zoomTransition = true;
        this.selectedLevel = 4;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(768 * 1.5, 1024 * 1.5);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(768 * 3, 1024 * 3);
        this.zoomTime = 0;
    },

    moveRight: function () {
        var i = Math.min(this.selectedLevel + 1, this.hdim * this.vdim);
        this.selectLevel(i);
    },

    moveLeft: function () {
        var i = Math.max(this.selectedLevel - 1, 0);
        this.selectLevel(i);
    },

    moveUp: function () {
        var i = Math.max(this.selectedLevel - this.vdim, 0);
        this.selectLevel(i);
    },

    moveDown: function () {
        var i = Math.min(this.selectedLevel + this.vdim, this.hdim * this.vdim);
        this.selectLevel(i);
    },

    draw: function (dt) {
        this.drawDt += dt;
        if (this.drawDt > this.framerate) {
            
            this.currentDrawTime = new Date().getTime();
            
            this.lastDrawTime = this.currentDrawTime;

            this.camera.reset(this.waterfall.bgColor);

            this.camera.show();
           
            /*if (this.hoverLevel > -1) {
                var color = 'rgba(100,100,255,1)',
                    b = this.levelButtons[this.hoverLevel];
                this.canvas.rectangleOutline(b.p1, b.p2, b.p3, b.p4, 4, color);
            }*/
            
            this.waterfall.draw(this.drawDt);
            
            this.drawDt = 0;
        }
    }
};
