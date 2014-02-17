'use strict';

function PointSource(x, y, r, theta, v) {
    this.base = Rectangle;
    this.base(x, y, r, r, theta);
    this.radius = r;
    this.v = v || 0.5;
}

PointSource.prototype = new Rectangle();

PointSource.prototype.gameObjectType = function () {
    return "PointSource";
};

function Source(x, y, w, h, theta, v) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.v = v || 0.5;
    this.pulsedt = 0;
    this.pulselength = 1000;
}

Source.prototype = new Rectangle();

Source.prototype.gameObjectType = function () {
    return "Source";
};

Source.prototype.update = function (dt) {
    this.pulsedt += dt;
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Source.prototype.draw = function (canvas, color) {
    var alpha = 1.0;
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 20, color, 0.25);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 10, color, 0.5);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 5, [255, 255, 255], 0.9);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 30, color, 0.15);
};

var sourceFromJson = function (j) {
    return new Source(j.x, j.y, j.w, j.h, j.theta, j.v);
};


