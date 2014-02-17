'use strict';

var Grid = function (w, h, gridx, gridy) {
    var i, j, p1, p2, x1, y1, x2, y2,
        ncols = Math.round(this.w / this.gridx),
        nrows = Math.round(this.h / this.gridy);
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
};

Grid.prototype = {
    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    draw: function (canvas, color) {
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 30, color, 0.25);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 15, color, 0.75);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 10, color, 1.0);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 5, [255, 255, 255], 0.8);
    }
};

var GridWall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p1;
    this.p4 = p2;
    this.hasDoor = false;
    this.doorIsOpen = false;
    this.randomSeed = 100;
    this.doorPoints = [];

    $(document).bind('opendoor', $.proxy(function (e) {
        console.log("open door message");
        this.doorIsOpen = true;
        console.log(this);
    }, this));

    $(document).bind('closedoor', $.proxy(function (e) {
        console.log("close door message");
        this.doorIsOpen = false;
    }, this));

};

GridWall.prototype = {
    gameObjectType: function () {
        return "GridWall";
    },

    hit : function (p) {
        var n, r = 10;
        if (this.hasDoor && this.doorIsOpen) {
            //if (p.circleCollision(this.p1, this.p2)) {
            if (p.lineCollision(this.p1, this.p2, r)) {
                n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
                return n;
            }
            if (p.lineCollision(this.p3, this.p4, r)) {
                n = new Vector(-(this.p4.y - this.p3.y), this.p4.x - this.p3.x).normalize();
                return n;
            }
        } else {
            if (p.lineCollision(this.p1, this.p4, r)) {
                n = new Vector(-(this.p4.y - this.p1.y), this.p4.x - this.p1.x).normalize();
                return n;
            }
        }
        return undefined;
    },

    circleHit : function (p) {
        var n, r = 10;
        if (this.hasDoor && this.doorIsOpen) {
            if (p.circleCollision(this.p1, this.p2)) {
                n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
                return n;
            }
            if (p.circleCollision(this.p3, this.p4)) {
                n = new Vector(-(this.p4.y - this.p3.y), this.p4.x - this.p3.x).normalize();
                return n;
            }
        } else {
            if (p.circleCollision(this.p1, this.p4)) {
                n = new Vector(-(this.p4.y - this.p1.y), this.p4.x - this.p1.x).normalize();
                return n;
            }
        }
        return undefined;
    },

    setDoor : function (s1, s2) {
        this.hasDoor = true;
        this.setS1(s1);
        this.setS2(s2);
    },

    setS1 : function (s1) {
        var doorjam = 20,
            v = new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y),
            n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
        this.hasDoor = true;
        this.p2 = new Vector(this.p1.x + v.x * s1, this.p1.y + v.y * s1);
        this.p5 = new Vector(this.p2.x + n.x * doorjam, this.p2.y + n.y * doorjam);
        this.p6 = new Vector(this.p2.x - n.x * doorjam, this.p2.y - n.y * doorjam);
        this.makeElectricity();
         
    },

    setS2 : function (s2) {
        var doorjam = 20,
            v = new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y),
            n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
        this.hasDoor = true;
        this.p3 = new Vector(this.p1.x + v.x * s2, this.p1.y + v.y * s2);
        this.p7 = new Vector(this.p3.x + n.x * doorjam, this.p3.y + n.y * doorjam);
        this.p8 = new Vector(this.p3.x - n.x * doorjam, this.p3.y - n.y * doorjam);
        this.makeElectricity();
    },
     
    getS1 : function () {
        var l1 = VectorMath.length(new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y)),
            l2 = VectorMath.length(new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y));
        return l2 / l1;
    },

    getS2 : function () {
        var l1 = VectorMath.length(new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y)),
            l2 = VectorMath.length(new Vector(this.p3.x - this.p1.x, this.p3.y - this.p1.y));
        return l2 / l1;
    },

    drawDoor: function (canvas, color, alpha) {
        var i, p1, p2, doorjam = 100;
        
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 20, color, alpha * 0.5);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 10, color, alpha * 0.75);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 5, [255, 255, 255], alpha * 0.5);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 30, color, 0.25);
        }

    },

    draw : function (canvas, color) {
        var p1, p2, n, doorjam = 50;
        if (this.hasDoor) {
            canvas.line(this.p1, this.p2, 30, color, 0.25);
            canvas.line(this.p1, this.p2, 15, color, 0.75);
            canvas.line(this.p1, this.p2, 10, color, 1.0);
            canvas.line(this.p1, this.p2, 5, [255, 255, 255], 0.8);
            canvas.line(this.p3, this.p4, 30, color, 0.25);
            canvas.line(this.p3, this.p4, 15, color, 0.75);
            canvas.line(this.p3, this.p4, 10, color, 1.0);
            canvas.line(this.p3, this.p4, 5, [255, 255, 255], 0.8);
            //doorjam
            canvas.line(this.p5, this.p6, 30, color, 0.25);
            canvas.line(this.p5, this.p6, 15, color, 0.75);
            canvas.line(this.p5, this.p6, 10, color, 1.0);
            canvas.line(this.p7, this.p8, 30, color, 0.25);
            canvas.line(this.p7, this.p8, 15, color, 0.75);
            canvas.line(this.p7, this.p8, 10, color, 1.0);

            if (!this.doorIsOpen) {
                //darw some electricity
                this.drawDoor(canvas, [100, 100, 255], 1.0);
                //canvas.electricityLine(this.p2, this.p3, 5, 2, [100, 100, 255], 1.0);
            }
        } else {
            canvas.line(this.p1, this.p4, 30, color, 0.25);
            canvas.line(this.p1, this.p4, 15, color, 0.75);
            canvas.line(this.p1, this.p4, 10, color, 1.0);
            canvas.line(this.p1, this.p4, 5, [255, 255, 255], 0.8);
        }
    },

    makeElectricity: function () {
        var i, shockiness = 3, npoints = shockiness * 3,
            v = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y),
            n = VectorMath.normalize(new Vector(-v.y, v.x)), l = VectorMath.length(v), dl;
        this.doorPoints.length = 0;
        this.doorPoints[0] = [this.p2.x, this.p2.y];
        this.doorPoints[npoints - 1] = [this.p3.x, this.p3.y];
        for (i = 1; i < npoints - 1; i += 1) {
            this.doorPoints[i] = [this.p2.x + i / npoints * v.x, this.p2.y + i / npoints * v.y];
            dl = (Math.random()) * shockiness * 2;
            this.doorPoints[i][0] += n.x * dl;
            this.doorPoints[i][1] += n.y * dl;
            //this.linexy(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], lineWidth, color, alpha);
        }
        //this.linexy(points[npoints - 2][0], points[npoints - 2][1], points[npoints - 1][0], points[npoints - 1][1], lineWidth, color, alpha);
    }
};

var GameGrid =  function (w, h, gridx, gridy) {
    var i, j, p1, p2, x1, y1, x2, y2,
        ncols = Math.round(w / gridx),
        nrows = Math.round(h / gridy);
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
    this.lines = [];
    this.rows = [];
    this.cols = [];
    for (i = 0; i < nrows + 1; i += 1) {
        this.rows[i] = i * gridy;
        for (j = 0; j < ncols; j += 1) {
            p1 = new Vector(gridx * j, this.gridy * i);
            p2 = new Vector(gridx * (j + 1), this.gridy * i);
            this.lines.push(new GridWall(p1, p2));
        }
    }
    for (i = 0; i < ncols + 1; i += 1) {
        this.cols[i] = i * gridx;
        for (j = 0; j < nrows; j += 1) {
            p1 = new Vector(this.gridx * i, gridy * j);
            p2 = new Vector(this.gridx * i, gridy * (j + 1));
            this.lines.push(new GridWall(p1, p2));
        }
    }
};

GameGrid.prototype = {
    nCols: function () {
        return Math.round(this.w / this.gridx);
    },

    nRows: function () {
        return Math.round(this.h / this.gridy);
    },

    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    sameTile: function (o1, o2) {
        return this.tileNumber(o1.x, o1.y) === this.tileNumber(o2.x, o2.y);
    },

    tileNumber: function (x, y) {
        var i, tile = -1;
        for (i = 0; i < this.cols.length - 1; i += 1) {
            if (x > this.cols[i] && x < this.cols[i + 1]) {
                tile = i + 1;
                break;
            }
        }
        for (i = 0; i < this.rows.length - 1; i += 1) {
            if (y > this.rows[i] && y < this.rows[i + 1]) {
                tile *= i + 1;
                break;
            }
        }
        return tile;
    },

    draw: function (canvas, color) {
        var i = 0;
        for (i = 0; i < this.lines.length; i += 1) {
            this.lines[i].draw(canvas, color);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 30, color, 0.25);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 15, color, 0.75);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 10, color, 1.0);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 5, [255, 255, 255], 0.8);
        }
    },

    selectionHit : function (p) {
        var i, n;
        for (i = 0; i < this.lines.length; i += 1) {
            n = this.lines[i].circleHit(p);
            if (n) {
                return n;
            }
        }
        return undefined;
    },

    hit : function (p) {
        var i, n;
        for (i = 0; i < this.lines.length; i += 1) {
            n = this.lines[i].hit(p);
            if (n) {
                return n;
            }
        }
        return undefined;
    }
};

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


