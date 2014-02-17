'use strict';
//check here for a pretty good particle / quadtree tutorial
//http://gamedevelopment.tutsplus.com/tutorials/make-your-game-pop-with-particle-effects-and-quadtrees--gamedev-2138
var Particle = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
    this.age = 0;
    this.dir = new Vector(1, 0);
    this.vel = new Vector(1, 0);
    this.mass = this.inv_mass = 1;
    this.radius = r || 4;
    this.trail = [];
    this.numTracers = 30;
    this.traceWidth = 1;
    this.brightness = 0;
    var i = 0, t;
    for (i = 0; i < this.numTracers; i += 1) {
        t = new Tracer(this.x, this.y);
        this.trail.push(t);
    }
};

Particle.prototype = {

    recycle : function (x, y, vx, vy) {
        var i = 0;
        this.x = x;
        this.y = y;
        this.prevx = x;
        this.prevy = y;
        this.age = 0;
        this.brightness = 0;
        this.vel.x = vx;
        this.vel.y = vy;
        for (i = 0; i < this.numTracers; i += 1) {
            this.trail[i].x = x;
            this.trail[i].y = y;
        }
    },
 
    move : function (dt) {
        this.prevx = this.x;
        this.prevy = this.y;
        //TODO: remove the 0.1x factor and rebalance all influencers and sinks
        this.x += this.vel.x;// * dt * 0.09;
        this.y += this.vel.y;// * dt * 0.09;
        this.age += 1;
    },

    bounce : function (n) {
        var dot = 2 * VectorMath.dot(this.vel, n);
        this.vel.x -= dot * n.x;
        this.vel.y -= dot * n.y;
    },

    distanceSquared: function (p) {
        var dx = this.x - p.x,
            dy = this.y - p.y;
        return dx * dx + dy * dy;
    },

    trace: function () {
        var i = 0;
        for (i = 0; i < this.numTracers; i += 1) {
            this.trail[i].age += 1;
        }
        this.trail.unshift(this.trail.pop());
        this.trail[0].x = this.x;
        this.trail[0].y = this.y;
        this.trail[0].age = 0;
    },
    
    draw: function (canvas, color) {
        var i = 0, alpha = 1.0, t1, t2,
            c = canvas.brighten(color, this.brightness);
        canvas.circle(this.x, this.y, this.radius * 2, c, 0.25);
        canvas.circle(this.x, this.y, this.radius, color, 1);
        canvas.circle(this.x, this.y, this.radius * 0.5, [255, 255, 255], 1);
        for (i = 1; i < this.numTracers; i += 1) {
            t1 = this.trail[i - 1];
            t2 = this.trail[i];
            alpha = (this.numTracers - this.trail[i].age) / this.numTracers;
            //color = 'rgba(0,153,255,' + alpha + ')';
            canvas.line(t1, t2, this.traceWidth * 2, c, 0.25);
            canvas.line(t1, t2, this.traceWidth, color, alpha);
        }
    },

    lineCollision : function (p1, p2) {
        var LineA1 = new Vector(this.prevx, this.prevy),
            LineA2 = new Vector(this.x, this.y),
            LineB1 = new Vector(p1.x, p1.y),
            LineB2 = new Vector(p2.x, p2.y),
            denom = (LineB2.y - LineB1.y) * (LineA2.x - LineA1.x) - (LineB2.x - LineB1.x) * (LineA2.y - LineA1.y),
            ua,
            ub;
            
        if (denom !== 0) {
            ua = ((LineB2.x - LineB1.x) * (LineA1.y - LineB1.y) - (LineB2.y - LineB1.y) * (LineA1.x - LineB1.x)) / denom;
		    ub = ((LineA2.x - LineA1.x) * (LineA1.y - LineB1.y) - (LineA2.y - LineA1.y) * (LineA1.x - LineB1.x)) / denom;
		    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			    return null;
            }
            this.x = LineA1.x + ua * (LineA2.x - LineA1.x);
            this.y = LineA1.y + ua * (LineA2.y - LineA1.y);
            this.prevx = this.x;
            this.prevy = this.y;
		    return true;
        }
        return false;
    },

    circleCollision: function (p1, p2) {
        var LocalP1 = new Vector(p1.x - this.x, p1.y - this.y),
            LocalP2 = new Vector(p2.x - this.x, p2.y - this.y),
            P2MinusP1 = new Vector(LocalP2.x - LocalP1.x, LocalP2.y - LocalP1.y),
            a = (P2MinusP1.x * P2MinusP1.x) + (P2MinusP1.y * P2MinusP1.y),
            b = 2 * (P2MinusP1.x * LocalP1.x + P2MinusP1.y * LocalP1.y),
            c = LocalP1.x * LocalP1.x + LocalP1.y * LocalP1.y - this.radius * this.radius,
            delta = b * b - (4 * a * c),
            u1,
            u2,
            SquareRootDelta;

        if (delta === 0) {
            u1 = -b / (2 * a);
            if (u1 >= 0.0 && u1 <= 1.0) {
                return true;
            }
        } else if (delta > 0) {
            SquareRootDelta = Math.sqrt(delta);
            u1 = (-b + SquareRootDelta) / (2 * a);
            u2 = (-b - SquareRootDelta) / (2 * a);
            if (u1 >= 0 && u1 <= 1.0 && u2 >= 0 && u2 <= 1.0) {
                return true;
            }
        }
        return false;
    },

    circleCircleCollision: function (x1, y1, r1) {
        var x2 = this.x,
            y2 = this.y,
            r2 = this.radius,
            d = r1 + r2,
            v12 = new Vector(x2 - x1, y2 - y1),
            d12 = v12.length();
        if (d12 < d) {
            return new Vector((x1 * r2 + x2 * r1) / (r1 + r2), (y1 * r2 + y2 * r1) / (r1 + r2));
        }
    }
};

var Tracer = function (x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
};


var PassiveParticle = function (x, y, r, particlelength, numTracers, lifetime) {
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
    this.particlelength = Math.random() * 0.1 + particlelength * 0.9;
    this.age = 0;
    this.lifetime = lifetime || 3000;
    this.dir = new Vector(1, 0);
    this.vel = new Vector(1, 0);
    this.accel = -0.0003;
    this.mass = this.inv_mass = 1;
    this.radius = r || 4;
    this.trail = [];
    this.numTracers = numTracers || 0;
    this.traceWidth = 5;
    this.color = [0, 0, 255];
    this.fadeColorIn = true;
    var i = 0, t;
    for (i = 0; i < this.numTracers; i += 1) {
        t = new Tracer(this.x, this.y);
        this.trail.push(t);
    }
};

PassiveParticle.prototype = {

    move : function (dt) {
        this.prevx = this.x;
        this.prevy = this.y;
        this.vel.x += this.dir.x * this.accel * dt;
        this.vel.y += this.dir.y * this.accel * dt;
        this.x += this.vel.x * dt;
        this.y += this.vel.y * dt;
    },

    recycle : function (x, y, vx, vy) {
        var i = 0;
        this.x = x;
        this.y = y;
        this.prevx = x;
        this.prevy = y;
        this.age = 0;
        this.vel.x = vx;
        this.vel.y = vy;
        this.dir = VectorMath.normalize(new Vector(this.vel.x, this.vel.y));
        
        for (i = 0; i < this.numTracers; i += 1) {
            this.trail[i].x = x;
            this.trail[i].y = y;
        }
    },

    trace: function () {
        var i = 0, n = this.numTracers;
        for (i = 0; i < n; i += 1) {
            this.trail[i].age += 1;
        }
        if (n > 0) {
            this.trail.unshift(this.trail.pop());
            this.trail[0].x = this.x;
            this.trail[0].y = this.y;
            this.trail[0].age = 0;
        }
    },
 
    update: function (dt) {
        this.move(dt);
        this.age += dt;
    },

    draw: function (canvas, color, alpha) {
        var i = 0, t1, t2, c = color, l;
        alpha = alpha || 1.0;
        this.trace();
        if (this.particlelength > 0) {
            l = this.particlelength * alpha;
            canvas.linexy(this.x,
                          this.y,
                          this.x - this.dir.x * l,
                          this.y - this.dir.y * l,
                          10,
                          c,
                          alpha * 0.25);
            canvas.linexy(this.x,
                          this.y,
                          this.x - this.dir.x * l,
                          this.y - this.dir.y * l,
                          5,
                          [255, 255, 255],
                          alpha);
        } else {
            canvas.circle(this.x, this.y, this.radius * 2, c, 0.25 * alpha);
            canvas.circle(this.x, this.y, this.radius, c, alpha);
        }
        for (i = 1; i < this.numTracers; i += 1) {
            t1 = this.trail[i - 1];
            t2 = this.trail[i];
            alpha *= (this.numTracers - this.trail[i].age) / this.numTracers;
            canvas.line(t1, t2, this.traceWidth, c, alpha);
            //canvas.line(t1, t2, this.traceWidth * 5, c, alpha * 0.25);
        }
    }
};

var ParticleSystem = function (x, y, image) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.startSpeed = 0.02;
    this.startAccel = 0.0003;
    this.alpha = 1.0;
    this.lifetime = 5000;
    this.particles = [];
    this.pool = [];
    this.active = [];
};

ParticleSystem.prototype = {

    init: function (x, y, particleradius, particlelength, ntracers, nparticles, image) {
        var i = 0;
        this.x = x;
        this.y = y;
        this.image = image;
        particlelength = particlelength || 0;
        for (i = 0; i < nparticles; i += 1) {
            this.pool.push(new PassiveParticle(x, y, particleradius, particlelength, ntracers));
        }
    },
    
    burst: function (x, y, burstradius, speed, accel, nparticles, lifetime) {
        var i = 0, theta, p, s;
        this.lifetime = lifetime || this.lifetime;
        this.speed = speed;
        for (i = 0; i < nparticles; i += 1) {
            if (this.pool.length <= 0) {
                break;
            }
            theta = Math.random() * Math.PI * 2;
            p = this.pool.pop();
            p.speed = speed;
            p.accel = accel;
            p.lifetime = lifetime;
            s = speed + Math.random() * speed * 0.1;
            p.recycle(x + Math.sin(theta) * 1.5 * burstradius * Math.random(),
                      y + Math.cos(theta) * 1.5 * burstradius * Math.random(),
                      Math.sin(theta) * s,
                      Math.cos(theta) * s);
            this.active.push(p);
        }
    },

    update: function (dt) {
        var i = 0, theta, p;
        for (i = this.active.length - 1; i >= 0; i -= 1) {
            this.active[i].update(dt);
            //console.log(this.active[i].age);
            if (this.active[i].age > this.lifetime) {
                p = this.active.splice(i, 1)[0];
                p.recycle(this.x, this.y, 0, 0);
                this.pool.push(p);
            }
        }
    },

    draw: function (canvas, color) {
        var i = 0, alpha;
        for (i = 0; i < this.active.length; i += 1) {
            alpha = 1 - this.active[i].age / this.lifetime;
            this.active[i].draw(canvas, color, alpha);
            //this.active[i].trace();
        }
    }
};
