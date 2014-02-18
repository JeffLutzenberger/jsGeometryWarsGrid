'use strict';

var PointMass = function (x, y, invMass) {
    this.x = x;
    this.y = y;
    this.vel = new Vector(0, 0);
    this.inverseMass = invMass;
    this.accel = new Vector(0, 0);
    this.damping = 0.98;
    //this.damping = 0.75;
};

PointMass.prototype = {
 
    applyForce: function (force) {
        this.accel.x += force.x * this.inverseMass;
        this.accel.y += force.y * this.inverseMass;
    },
 
    increaseDamping: function (factor) {
        this.damping *= factor;
    },
 
    update: function (dt) {
        //dt *= 0.1;
        dt = 1.0;
        this.vel.x += this.accel.x * dt;
        this.vel.y += this.accel.y * dt;
        this.x += this.vel.x * dt;
        this.y += this.vel.y * dt;
        this.accel.x = 0;
        this.accel.y = 0;
        if (VectorMath.squaredLength(this.vel) < 0.001 * 0.001) {
            this.vel.x = 0;
            this.vel.y = 0;
        }
 
        this.vel.x *= this.damping;
        this.vel.y *= this.damping;
        this.damping = 0.98;
    }
};

var Spring = function (end1, end2, stiffness, damping) {
    this.end1 = end1;
    this.end2 = end2;
    this.stiffness = stiffness;
    this.damping = damping;
    this.targetLength = VectorMath.length(new Vector(end1.x - end2.x, end1.y - end2.y));
};

Spring.prototype = {
    
    update: function (dt) {
        var x = new Vector(this.end1.x - this.end2.x, this.end1.y - this.end2.y),
            length = VectorMath.length(x),
            dv = new Vector(this.end2.vel.x - this.end1.vel.x, this.end2.vel.y - this.end1.vel.y),
            force;
        dt = 1.0;

        if (length <= this.targetLength) {
            return;
        }

        x.x = x.x / length * (length - this.targetLength);
        x.y = x.y / length * (length - this.targetLength);

        force = new Vector(this.stiffness * x.x - dv.x * this.damping * dt,
                           this.stiffness * x.y - dv.y * this.damping * dt);

        this.end1.applyForce(new Vector(-force.x, -force.y));
        this.end2.applyForce(force);
    }
};


var BackgroundGrid =  function (w, h, gridx, gridy) {
    var x, y,
        ncols = Math.round(w / gridx) + 1,
        nrows = Math.round(h / gridy) + 1,
        stiffness = 0.28,
        damping = 0.08,
        column = 0,
        row = 0;
    this.springs = [];
    this.points = [];
    this.fixedPoints = [];
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
    this.lines = [];
    this.rows = [];
    this.cols = [];

    // create the point masses
    for (x = 0; x <= w; x += gridx) {
        this.points[column] = [];
        this.fixedPoints[column] = [];
        for (y = 0; y <= h; y += gridy) {
            this.points[column][row] = new PointMass(x, y, 1);
            this.fixedPoints[column][row] = new PointMass(x, y, 1);
            row += 1;
        }
        column += 1;
        row = 0;
    }

    // link the point masses with springs
    for (y = 0; y < nrows; y += 1) {
        for (x = 0; x < ncols; x += 1) {
            if (x === 0 || y === 0 || x === ncols - 1 || y === nrows - 1) {
                // anchor the border of the grid 
                this.springs.push(new Spring(this.fixedPoints[x][y], this.points[x][y], 0.1, 0.1));
            } else if (x % 3 === 0 && y % 3 === 0) {
                // loosely anchor 1/9th of the point masses 
                this.springs.push(new Spring(this.fixedPoints[x][y], this.points[x][y], 0.002, 0.02));
            }
 
            if (x > 0) {
                this.springs.push(new Spring(this.points[x - 1][y], this.points[x][y], stiffness, damping));
            }
            if (y > 0) {
                this.springs.push(new Spring(this.points[x][y - 1], this.points[x][y], stiffness, damping));
            }
        }
    }
};

BackgroundGrid.prototype = {
    update: function (dt) {
        var i = 0, j = 0;
        for (i = 0; i < this.springs.length; i += 1) {
            this.springs[i].update(dt);
        }
        for (i = 0; i < this.points.length; i += 1) {
            for (j = 0; j < this.points[i].length; j += 1) {
                this.points[i][j].update(dt);
            }
        }
    },

    applyExplosiveForce: function (force, position, radius) {
        var i, j, dist2, mass, f;
        for (i = 0; i < this.points.length; i += 1) {
            for (j = 0; j < this.points[i].length; j += 1) {
                mass = this.points[i][j];
                dist2 = VectorMath.squaredLength(new Vector(position.x - mass.x, position.y - mass.y));
                if (dist2 < radius * radius) {
                    f = new Vector(mass.x - position.x, mass.y - position.y);
                    f.x *= 100 * force / (10000 + dist2);
                    f.y *= 100 * force / (10000 + dist2);
                    mass.applyForce(f);
                    mass.increaseDamping(0.6);
                }
            }
        }
    },

    draw: function (canvas, color) {
        var i = 0, x = 0, y = 0,
            width = this.points.length,
            height = this.points[0].length,
            left, up, p, thickness;
        
        for (y = 0; y < height; y += 1) {
            for (x = 0; x < width; x += 1) {
                p = new Vector(this.points[x][y].x, this.points[x][y].y);
                if (x > 0) {
                    thickness = (y + 1) % 4 === 1 ? 2.0 : 1.0;
                    left = new Vector(this.points[x - 1][y].x, this.points[x - 1][y].y);
                    //draw line left to p
                    //canvas.line(left, p, thickness * 3, color, 0.25);
                    //canvas.line(left, p, thickness * 1.5, color, 0.75);
                    canvas.line(left, p, thickness, color, 1.0);
                    //canvas.line(left, p, thickness * 0.5, [255, 255, 255], 0.8);
                }
                if (y > 0) {
                    thickness = (x + 1) % 4 === 1 ? 2.0 : 1.0;
                    up = new Vector(this.points[x][y - 1].x, this.points[x][y - 1].y);
                    //draw line from up to p
                    //canvas.line(up, p, thickness * 3, color, 0.25);
                    //canvas.line(up, p, thickness * 1.5, color, 0.75);
                    canvas.line(up, p, thickness, color, 1.0);
                    //canvas.line(up, p, thickness * 0.5, [255, 255, 255], 0.8);
                }
            }
        }
    }
};


