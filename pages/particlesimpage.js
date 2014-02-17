'use strict';
/**
 * The gameboard controller is responsible for setting up a level and managing gameplay for
 * a level
 * */
var ParticleSimPage = function (canvas, hdim, vdim) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.grid = new GameGrid(768, 1024, 768, 1024);
    //this.waterfall = new ParticleWorld(canvas, this.grid);
    this.explosion = new ParticleSystem(768 * 0.5, 1024 * 0.5) 
    this.hdim = hdim || 3;
    this.vdim = vdim || 3;
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(768 * 0.5, 1025 * 0.5);
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
    this.init();
};

ParticleSimPage.prototype = {

    init: function () {
        //create our particle effect and make it explode...
        this.explosion.init(this.configs.x,
                            this.configs.y,
                            this.configs.particleradius,
                            this.configs.particlelength,
                            this.configs.ntracers,
                            this.configs.nparticles);

        this.explosion.burst(this.configs.x,
                             this.configs.y,
                             this.configs.burstradius,
                             this.configs.speed,
                             this.configs.accel,
                             this.configs.nburstparticles,
                             this.configs.lifetime);
    },

    setHandlers: function () {
        $('canvas').unbind();
        $(document).unbind();
        this.showUI();
    },

    showUI: function () {
        $("#editor-form").html('');
        $("#editor-form").off();

        $("#editor-form").append('<input id="particle-burst-button" type="button" value="Burst">').button();
        $("#particle-burst-button").click($.proxy(function () {
            this.explosion.burst(this.configs.x,
                             this.configs.y,
                             this.configs.burstradius,
                             this.configs.speed,
                             this.configs.accel,
                             this.configs.nburstparticles,
                             this.configs.lifetime);

        }, this));
    },

    update: function (dt) {
        this.explosion.update(dt);
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

            this.explosion.draw(this.canvas, [255, 255, 255]);

            this.drawDt = 0;
        }
    }
};
