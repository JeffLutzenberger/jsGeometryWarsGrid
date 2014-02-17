'use strict';
/*
 * This effect draws translucent, slowly moving blobs onto the a background image
 *
 */
var BackgroundEffect = function (w, h, nParticles, bgcolor) {
    this.particles = [];
    this.nParticles = nParticles;
    this.radius = 50;
    this.speed = 5;
    this.lifetime = 20;
    this.color = [255, 255, 255];
    this.alpha = 0.05;
    this.composite = 'lighter';
    this.width = w;
    this.height = h;
    this.bgcolor = bgcolor;
    this.buffercanvas = document.createElement('canvas');
    this.buffercanvas.width = w;
    this.buffercanvas.height = h;
    this.canvas = new Canvas(this.buffercanvas);
    this.ctx = this.buffercanvas.getContext('2d');
    this.ctx.fillStyle = bgcolor;
    this.ctx.rect(0, 0, w, h);
    this.ctx.fill();
    this.init();
};

BackgroundEffect.prototype = {

    init: function () {
        var i, p, vx, vy;
        for (i = 0; i < this.nParticles; i += 1) {
            p = new Particle(Math.random() * this.width,
                             Math.random() * this.height,
                             this.radius);
            p.vel.x = Math.random() * this.speed * ((Math.random() < 0.5) ? -1 : 1);
            p.vel.y = Math.random() * this.speed * ((Math.random() < 0.5) ? -1 : 1);
            console.log(p);
            this.particles.push(p);
        }
    },

    update: function (dt) {
        var i;
        for (i = 0; i < this.nParticles; i += 1) {
            this.checkBounds(this.particles[i]);
            this.particles[i].move();
        }
    },

    draw: function (canvas) {
        var i, radius = 50;

        this.canvas.clear(this.bgcolor);
        for (i = 0; i < this.nParticles; i += 1) {
            this.canvas.circle(this.particles[i].x,
                               this.particles[i].y,
                               this.radius,
                               this.color,
                               this.alpha);
            /*this.canvas.radialGradient(this.particles[i].x,
                                  this.particles[i].y,
                                  this.radius * 0.25,
                                  this.radius,
                                  this.color,
                                  this.color,
                                  0.1,
                                  0.0);*/
        }

        //stackBlurCanvasRGBA( this.ctx, 0, 0, this.width, this.height, radius);
        //this.ctx.putImageData(this.imgdata, 0, 0);
        //return this.buffercanvas;
        canvas.ctx.drawImage(this.canvas.canvas, -768 * 3 * 0.5, -1024 * 3 * 0.5, 768 * 3, 1024 * 3);
        //canvas.ctx.drawImage(this.buffercanvas, -this.width * 0.5, -this.height * 0.5);
    },

    checkBounds: function (p) {
        if (p.x < -this.radius) {
            p.x = this.width + this.radius;
        } else if (p.x > this.width + this.radius) {
            p.x = -this.radius;
        }
        if (p.y < -this.radius) {
            p.y = this.height + this.radius;
        } else if (p.y > this.height + this.radius) {
            p.y = -this.radius;
        }
    }

};


