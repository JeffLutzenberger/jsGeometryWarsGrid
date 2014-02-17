'use strict';

var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype = {

    squaredLength: function () {
        return (this.x * this.x) + (this.y * this.y);
    },

    length: function () {
        return Math.sqrt(this.squaredLength());
    },

    scalarMultiply: function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    },

    normalize: function () {
        var l = this.length();
        this.x /= l;
        this.y /= l;
        return this;
    },

    dot: function (v) {
        return this.x * v.x + this.y * v.y;
    },

    toString: function () {
        return "[" + this.x + "," + this.y + "]";
    }
};

/**
 * VectorMath does not mutate vectors
 * */
var VectorMath = {
    squaredLength: function (v) {
        return v.x * v.x + v.y * v.y;
    },

    length: function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },
    
    normalize: function (v) {
        var vector = new Vector(v.x, v.y), l = 1 / VectorMath.length(vector);
        vector.x *= l;
        vector.y *= l;
        return vector;
    },

    dot: function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    },

    rotatePoint : function (v, theta) {
        var x1 = Math.cos(theta) * v.x + Math.sin(theta) * v.y,
            y1 = -Math.sin(theta) * v.x + Math.cos(theta) * v.y;
        return new Vector(x1, y1);
    },

    scalarMultiply: function (v, num) {
        return new Vector(v.x * num, v.y * num);
    }
};
