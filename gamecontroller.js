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
    this.gridpage = new GridPage(this.canvas, 3, 3);
    this.interval = setInterval(this.update.bind(this), this.clockrate);
    this.gridpage.setHandlers();

    $("#main-menu-button").click($.proxy(function () {
        this.gridpage.setHandlers();
    }, this));
};

GameController.prototype = {

    update: function () {
        this.currentTime = new Date().getTime();
        this.dt = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
        this.gridpage.update(this.dt);
    }
};
