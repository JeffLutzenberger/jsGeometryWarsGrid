'use strict';
/**
 * The gameboard controller is responsible for setting up a level and managing gameplay for
 * a level
 * */
var GridPage = function (canvas, hdim, vdim) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.backgroundGrid = new BackgroundGrid(768, 1024, 768 / 32, 1024 / 32);
    this.influencer = new Influencer(768 * 0.5, 1024 * 0.5, 15, 1);
    this.gameObjectForm = new GameObjectEditForm(this.influencer);
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.mouseDown = false;
    this.interactable = null;
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(768 * 0.5, 1025 * 0.5);
    this.influencerColor = [0, 153, 255];
    this.gridColor = [200, 50, 255];
    this.configs = {
        x : 768 * 0.5,
        y : 1024 * 0.5,
        particleradius : 5,
        particlelength : 50,
        nparticles : 300,
        nburstparticles: 50,
        burstradius : 50,
        speed : 0.6,
        accel : -0.0005,
        ntracers : 10,
        lifetime : 1000
    };
};

GridPage.prototype = {

    setHandlers: function () {
        $('canvas').unbind();
        $(document).unbind();
        this.showUI();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
        
            if (this.influencer.bbHit(p)) {
                this.interactable = this.influencer;
                this.interactable.selected = true;
                //return true;
            }

            this.mouseDown = true;
            this.gameObjectForm.gameObject = this.interactable;
            this.gameObjectForm.hide();
            if (this.interactable) {
                this.gameObjectForm.show();
            }
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.mouseDown = false;
            this.interactable = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            
            if (this.interactable) {
                this.interactable.setxy(p.x, p.y);
                this.gameObjectForm.updateLocation();
            }
            //this.hoverLevel = this.levelButtonHit(p.x, p.y);
        }, this));


    },

    showUI: function () {
        $("#editor-form").html('');
        $("#editor-form").off();
    },

    update: function (dt) {
        var o = this.influencer;
        this.backgroundGrid.applyExplosiveForce(o.force * 4, new Vector(o.x, o.y), o.radius * 10);
        this.backgroundGrid.update(dt);
        this.draw(dt);
    },

    draw: function (dt) {
        this.drawDt += dt;
        
        if (this.drawDt > this.framerate) {
            
            this.currentDrawTime = new Date().getTime();
            
            this.lastDrawTime = this.currentDrawTime;

            this.camera.reset('rgba(0,0,0,1.0)');

            this.camera.show();
          
            //this.canvas.circle(768 * 0.5, 1024 * 0.5, 200, [255, 255, 255], 1.0);
            
            this.backgroundGrid.draw(this.canvas, this.gridColor);

            this.influencer.draw(this.canvas, this.influencerColor, dt);

            this.drawDt = 0;
        }
    }
};
