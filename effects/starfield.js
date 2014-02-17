'use strict';

var StarField = function (w, h, canvas) {
    //procedural starfield
    this.w = w;
    this.h = h;
    this.canvas = canvas;

    this.buffercanvas = document.createElement('canvas');
    this.buffercanvas.width = w;
    this.buffercanvas.height = h;
    this.ctx = this.buffercanvas.getContext('2d');
    this.buffer = this.ctx.getImageData(0, 0, w, h);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.rect(0, 0, w, h);
    this.ctx.fill();

    this.noisecanvas = undefined; //makeOctaveNoise(w, h, 4);
    this.noise = undefined; //this.noisecanvas.getContext('2d').getImageData(0, 0, w, h).data;
    
};

StarField.prototype = {

    init: function () {
        var i, x, y;
        this.noisecanvas = this.makeOctaveNoise(this.w, this.h, 4);
        this.ctx = this.noisecanvas.getContext('2d');
        this.noise = this.noisecanvas.getContext('2d').getImageData(0, 0, this.w, this.h).data;
        //fill it with "stars" ...
        for (i = 0; i < 500; i += 1) {
            x = Math.random() * this.w;
            y = Math.random() * this.h;
            //console.log(x + "," + y);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            //this.ctx.beginPath();
            //this.ctx.moveTo(x, y);
            //this.ctx.arc(x, y, 5, 0, Math.PI * 2, false);
            this.ctx.fillRect(x, y, 1, 1);
            //this.ctx.fill();
        }
    },

    draw: function (canvas) {
        canvas.ctx.drawImage(this.noisecanvas, -768 * 3 * 0.5, -1024 * 3 * 0.5, 768 * 3, 1024 * 3);
    },

    makeNoise: function (width, height) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            imgData = ctx.getImageData(0, 0, width, height),
            data = imgData.data,
            pixels = data.length,
            i;

        canvas.width = width;
        canvas.height = height;

        for (i = 0; i < pixels; i += 4) {
            data[i] = Math.random() * 255 * 0.25;
            data[i + 1] = Math.random() * 255 * 0.1;
            data[i + 2] = Math.random() * 255 *0.5;
            data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);

        return canvas;
    },

    makeOctaveNoise: function (width, height, octaves) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            i;

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 1 / octaves;
        ctx.globalCompositeOperation = 'lighter';

        for (i = 0; i < octaves; i += 1) {
            var octave = this.makeNoise(width >> i, height >> i);
            ctx.drawImage(octave, 0, 0, width, height);
        }

        return canvas;
    }
}
