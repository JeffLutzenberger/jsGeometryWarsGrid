'use strict';

var GameController = function (canvas) {
    this.canvas = canvas;
    this.debug = false;
    this.influencer = -1;
    this.levelstats = [];
    this.levels = [];
    this.clockrate = 10; //ms
    this.dt = 0;
    this.currentTime = 0;
    this.lastTime = 0;
    this.gameState = 'start';
    this.gameboard = new Gameboard(this.canvas, 3, 3);
    this.particlesim = new ParticleSimPage(this.canvas, 0, 0);
    this.interval = setInterval(this.update.bind(this), this.clockrate);
    this.gameboard.setHandlers();

    $("#main-menu-button").click($.proxy(function () {
        this.gameState = 'start';
        this.gameboard.setHandlers();
    }, this));

    $("#particle-sim-button").click($.proxy(function () {
        this.gameState = 'particlesim';
        this.gameboard.hide();
        this.particlesim.setHandlers();
    }, this));
};

GameController.prototype = {

    update: function () {
        this.currentTime = new Date().getTime();
        this.dt = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
        if (this.gameState === 'start') {
            this.gameboard.update(this.dt);
        } else if (this.gameState === 'editor') {
            this.editorPage.update(this.dt);
        } else if (this.gameState === 'particlesim') {
            this.particlesim.update(this.dt);
        }
    }
};
