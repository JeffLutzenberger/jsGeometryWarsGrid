'use strict';

var Rectangle = function (x, y, w, h, theta) {
    this.x = x || 0; // centroid
    this.y = y || 0; // centroid
    this.w = w || 100;
    this.h = h || 100;
    this.theta = theta || 0;
    this.level = 1;
    this.selected = false;
    this.grabberSelected = false;
    this.interactable = false;
    this.updatePoints();
};

Rectangle.prototype = {

    gameObjectType : function () {
        return Rectangle;
    },

    rotatePoint : function (x, y, theta) {
        var degtorad = Math.PI / 180,
            x1 = Math.cos(theta * degtorad) * x + Math.sin(theta * degtorad) * y,
            y1 = -Math.sin(theta * degtorad) * x + Math.cos(theta * degtorad) * y;
        return new Vector(x1, y1);
    },

    updatePoints : function () {
        var xl1 = -this.w * 0.5,
            xl2 = this.w * 0.5,
            yl1 = -this.h * 0.5,
            yl2 = this.h * 0.5,
            theta = Math.PI / 180 * this.theta,
            pl1 = this.rotatePoint(xl1, yl1, this.theta),
            pl2 = this.rotatePoint(xl2, yl1, this.theta),
            pl3 = this.rotatePoint(xl2, yl2, this.theta),
            pl4 = this.rotatePoint(xl1, yl2, this.theta);

        this.p1 = new Vector(this.x + pl1.x, this.y + pl1.y);
        this.p2 = new Vector(this.x + pl2.x, this.y + pl2.y);
        this.p3 = new Vector(this.x + pl3.x, this.y + pl3.y);
        this.p4 = new Vector(this.x + pl4.x, this.y + pl4.y);
        this.n1 = new Vector(this.p1.x - this.p4.x, this.p1.y - this.p4.y).normalize();
        this.n2 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).normalize();
        this.n3 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y).normalize();
        this.n4 = new Vector(this.p4.x - this.p3.x, this.p4.y - this.p3.y).normalize();
    },

    setxy: function (x, y) {
        this.x = x;
        this.y = y;
        this.updatePoints();
    },

    draw: function (canvas, color) {
        canvas.rectangle(this.p1, this.p2, this.p3, this.p4, color);
        canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 1, 'rgba(100,100,100,1)');
        if (this.selected) {
            canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 2, 'rgba(0,100,255,1)');
        }
    },

    bbHit : function (p) {
        return (p.x >= this.x - this.w * 0.5 &&
                p.x <= this.x + this.w * 0.5 &&
                p.y >= this.y - this.h * 0.5 &&
                p.y <= this.y + this.h * 0.5);
    },

    hit : function (p) {
        var r = 10;
        if (p.lineCollision(this.p1, this.p2, r)) {
            return this.n1;
        }
        if (p.lineCollision(this.p2, this.p3, r)) {
            return this.n2;
        }
        if (p.lineCollision(this.p3, this.p4, r)) {
            return this.n3;
        }
        if (p.lineCollision(this.p4, this.p1, r)) {
            return this.n4;
        }
        return undefined;
    },

    circleHit : function (p) {
        return (p.circleCollision(this.p1, this.p2) ||
                p.circleCollision(this.p2, this.p3) ||
                p.circleCollision(this.p3, this.p4) ||
                p.circleCollision(this.p4, this.p1));
    }
};
