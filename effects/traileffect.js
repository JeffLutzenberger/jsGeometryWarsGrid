'use strict';
var TrailEffect = function (canvas) {
    var i = 0;
    this.exposure = 1.0;
    this.intensity = 1.0;
    this.red = 0.1;
    this.green = 1;
    this.blue = 1;
    this.width = 768;
    this.height = 1024;
    this.updateInterval = 100; //ms
    this.updateTime = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.buffer = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.FloatArray = window.Float32Array || Array;
    this.hdrdata= new this.FloatArray(this.buffer.data.length);
    for (i = 0; i < this.hdrdata.length; i += 1) {
        this.hdrdata[i] = 0;
        this.buffer.data[i] = 0;
    }
};

TrailEffect.prototype = {

    update: function (dt, p) {
        this.updateTime += dt;
        if (this.updateTime >= this.updateInterval) {
            this.updateTime = 0;
            /* 
             * note: p must be mapped from world space onto our buffer space
             * 
             * */
            var x = Math.floor((p.x + 768 * 1.5) * 0.333),
                y = Math.floor((p.y + 1024 * 1.5) * 0.333),
                index = (x + y * this.canvas.width) * 4;
            if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
                return;
            }
            this.buffer.data[index] = this.tonemap(this.hdrdata[index] += this.red * this.intensity);
            this.buffer.data[index + 1] = this.tonemap(this.hdrdata[index + 1] += this.green * this.intensity);
            this.buffer.data[index + 2] = this.tonemap(this.hdrdata[index + 2] += this.blue * this.intensity);
            this.buffer.data[index + 3] = 255;
        }
    },
    
    tonemap: function (n) {
        return (1 - Math.pow(2, -n * 0.05 * this.exposure)) * 255;
    },

    getCanvas: function () {
        this.ctx.putImageData(this.buffer, 0, 0);
        return this.canvas;
    },

    worldToBuffer: function (p, camera) {

    } 
};

