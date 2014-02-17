'use strict';

var Line = function (p1, p2) {
    var v = new Vector((p2.x + p1.x) * 0.5, (p2.y + p1.y) * 0.5);
    //console.log(v);
    this.x = v.x;
    this.y = v.y;
    v = new Vector(p2.x - p1.x, p2.y - p1.y);
    this.l = VectorMath.length(v); 
    this.prevx = this.x;
    this.prevy = this.y;
    this.age = 0;
    this.maxAge = 5000;
    this.vel = new Vector(0, 0);
    this.rotationSpeed = 0.01;
    this.speed = 0.1;
    this.age = 0;
    this.maxAge = 5000;
    v = VectorMath.normalize(v);
    this.theta = Math.atan2(v.y, v.x);
};

Line.prototype = {
    update: function (dt) {
        this.prevx = this.x;
        this.prevy = this.y;
        this.x += this.vel.x * dt;
        this.y += this.vel.y * dt;
        this.age += dt;
        this.theta += this.rotationSpeed * dt;
        if (this.theta > Math.PI * 2) {
            this.theta = 0;
        }
    },

    draw: function (canvas, color) {
        var x1 = this.l * 0.5 * Math.cos(this.theta),
            y1 = this.l * 0.5 * Math.sin(this.theta),
            x2 = -x1,
            y2 = -y1;
        x1 += this.x;
        y1 += this.y;
        x2 += this.x;
        y2 += this.y;
        canvas.linexy(x1, y1, x2, y2, 5, color, 1.0);
    }
};

var Diamond = function (x, y, w, h, theta) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.theta = theta;
    this.vertices = [];
};

Diamond.prototype = {
    rotateAndTranslateVertex: function (p) {
        //p = VectorMath.rotatePoint(p, this.theta);
        p.x += this.x;
        p.y += this.y;
        return p;
    },

    updateVertices: function () {
        //update vertices
        this.vertices = [new Vector(this.w * 0.5, 0),
                         new Vector(0, this.h * 0.5),
                         new Vector(-this.w * 0.5, 0),
                         new Vector(0, -this.h * 0.5)];
        this.vertices[0] = this.rotateAndTranslateVertex(this.vertices[0]);
        this.vertices[1] = this.rotateAndTranslateVertex(this.vertices[1]);
        this.vertices[2] = this.rotateAndTranslateVertex(this.vertices[2]);
        this.vertices[3] = this.rotateAndTranslateVertex(this.vertices[3]);
        //console.log(this.vertices);
    },

    getLines: function () {
        //return the lines that make up this shape
        //the lines are used to simulate explosions
        this.updateVertices();
        return [new Line(this.vertices[0], this.vertices[1]),
                new Line(this.vertices[1], this.vertices[2]),
                new Line(this.vertices[2], this.vertices[3]),
                new Line(this.vertices[3], this.vertices[0])];
    },

    explode: function (speed, rotationSpeed) {
        var v, i, lines = this.getLines();
        //console.log(lines);
        for (i = 0; i < lines.length; i += 1) {
            v = new Vector(lines[i].x - this.x, lines[i].y - this.y);
            v = VectorMath.normalize(v);
            lines[i].vel.x = v.x * speed;
            lines[i].vel.y = v.y * speed;
            lines[i].rotationSpeed = rotationSpeed;
        }
        return lines;
    }
};
