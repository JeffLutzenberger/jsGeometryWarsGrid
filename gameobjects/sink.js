'use strict';
/* global Rectangle, Vector, Particle */

var Sink = function (x, y, r, force, isSource) {
    var i, degtorad = Math.PI / 180;
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.speed = 10;
    this.isSource = isSource || true;
    this.influenceRadius = 5 * this.radius;
    this.sizeFactor = 1;
    this.targetSizeFactor = 3;
    this.maxSizeFactor = 4;
    this.showInfluenceRing = true;
    this.influenceBound = true;
    this.growthFactor = 0.15;
    this.decayFactor = 0.05;
    this.maxOrbitals = 4;
    this.orbitals = [];
    this.energy = 0;
    this.maxEnergy = 100;
    this.lockedInEnergyFactor = 0.25;
    this.energyPerOrbital = 10;
    this.flash = false;
    this.flashdt = 1e6;
    this.flashlength = 500;
    this.burstSize = 30;
    this.lockedIn = false;
    this.grabber = new Rectangle(x + Math.cos(this.theta) * this.r,
                                 y + Math.sin(this.theta) * this.r,
                                 20, 20, 0);
    this.grabberFadeLength = 1000;
    this.grabberFadeDt = 0;
    this.continuousPulse = false; //when we hit 90% of max
    this.pulseRates = [5000, 4000, 3000, 2000, 1000, 500, 250, 100]; //milliseconds
    this.ringpulsedt = 0;
    this.ringpulselength = 2000;
    this.pulsedt = 0;
    this.shells = [0,
                   90 * degtorad,
                   45 * degtorad,
                   (45 + 90) * degtorad,
                   22.5 * degtorad,
                   (22.5 + 90) * degtorad,
                   67.5 * degtorad,
                   (67.5 + 90) * degtorad];
    this.shellSin = this.shells.map(
        function (v) {
            return Math.sin(v);
        }
    );

    this.shellCos = this.shells.map(
        function (v) {
            return Math.cos(v);
        }
    );
};

Sink.prototype = new Rectangle();

Sink.prototype.gameObjectType = function () {
    return "Sink";
};

Sink.prototype.setRadius = function (val) {
    this.radius = val;
    this.influenceRadius = val * 5;
    this.w = val;
    this.h = val;
};

Sink.prototype.influence = function (p, maxSpeed) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        r2 = Math.max(v2.squaredLength(), this.radius * this.radius),
        res = this.force * this.sizeFactor * 1e4 / r2;
    res = Math.min(res, this.maxSpeed);
    v2 = v2.normalize();
    v2 = v2.scalarMultiply(res);
    p.vel.x += v2.x;
    p.vel.y += v2.y;
};

Sink.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 3 * this.radius * this.radius * this.sizeFactor * this.sizeFactor);
};

Sink.prototype.insideInfluenceRing = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.influenceRadius * this.influenceRadius * this.sizeFactor * this.sizeFactor);
};

Sink.prototype.hitGrabber = function (p) {
    var r = new Rectangle(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          20, 20, 0);
    return r.bbHit(p);
};

Sink.prototype.moveGrabber = function (p) {
    var v = new Vector(p.x - this.x, p.y - this.y),
        d = v.length();
    this.theta = Math.atan(v.y / v.x);
    if (v.x < 0) {
        this.theta -= Math.PI;
    }
};

Sink.prototype.trap = function (p) {
    var v = new Vector(p.vel.x, p.vel.y),
        c1 = new Particle(p.x, p.y, p.radius),
        p1 = new Vector(p.prevx, p.prevy),
        p2 = new Vector(p.x, p.y),
        d1 = new Vector(p1.x - this.x, p2.y - this.y).length(),
        d2 = new Vector(p2.x - this.x, p2.y - this.y).length(),
        hitPoint;
    if (d1 < d2) {
        hitPoint = c1.circleCircleCollision(this.x, this.y, this.influenceRadius);
        if (hitPoint) {
            v = new Vector(this.x - hitPoint.x, this.y - hitPoint.y);
            d1 = v.length() + 20;
            //there should only be a collision if the particle circle overlaps the edge
            //of the influence radius
            if (d1 >= this.influenceRadius) {
                return v.normalize();
            }
        }
    }
};

Sink.prototype.update = function (dt, hit) {
    var i;
    this.energy = Math.max(0, this.energy - this.energy * 0.0001 * dt);
    this.brightness = Math.min(this.brightness, 1.0);
    if (this.energy / this.maxEnergy >= this.lockedInEnergyFactor && this.lockedIn === false) {
        //level up: create some new random objects
        this.lockedIn = true;
        //$(document).trigger('levelup');
    }
    if (this.lockedIn) {
        //start grabber fade
        if (this.grabberFadeDt < this.grabberFadeLength) {
            this.grabberFadeDt += dt;
        } else {
            this.grabberFadeDt = this.grabberFadeLength;
        }
        this.energy = this.lockedInEnergyFactor * this.maxEnergy;
    }
       
    this.continuousPulse = true;
    this.pulsedt += dt;
    
    if (this.pulsedt >= this.pulseRates[this.getOrbitalShell()]) {
        this.pulsedt = 0;
        this.flashdt = 0;
    }
    
    if (this.flashdt >= 0 && this.flashdt < this.flashlength) {
        this.flashdt += dt;
    }

    this.ringpulsedt += dt;
    if (this.ringpulsedt > this.ringpulselength) {
        this.ringpulsedt = 0;
    }

    this.updateOrbitals(dt);
};

Sink.prototype.getOrbitalShell = function () {
    return Math.min(this.maxOrbitals, Math.round(this.energy / this.energyPerOrbital));
};

Sink.prototype.addEnergy = function () {
    this.energy += this.growthFactor;
    this.flash = true;
    if (this.energy > this.maxEnergy) {
        this.energy = this.maxEnergy;
    }
    if (this.getOrbitalShell() > this.orbitals.length) {
        this.addOrbital();
    }
};

Sink.prototype.addOrbital = function () {
    var p, ps;
    p = new Particle(this.x + this.radius * 4 * this.sizeFactor, this.y);
    p.orbitalRadius = this.radius * 2;
    p.theta = 0;
    p.speed = 0.01;// * (1 + Math.random());
    p.a = 2;//Math.random() * 2 + 1;
    p.b = 1;//Math.random() * 2 + 1;
    this.orbitals.push(p);
};

Sink.prototype.updateOrbitals = function (dt) {
    var i, p, v, r, x, y;
    if (this.getOrbitalShell() < this.orbitals.length) {
        this.orbitals.pop();
    }
    for (i = 0; i < this.orbitals.length; i += 1) {
        p = this.orbitals[i];
        p.prevx = p.x;
        p.prevy = p.y;
        p.theta = p.theta + p.speed * dt;
        if (p.theta > Math.PI * 2) {
            p.theta = 0;
        }
        x = p.a * p.orbitalRadius * this.sizeFactor * Math.cos(p.theta);
        y = p.b * p.orbitalRadius * this.sizeFactor * Math.sin(p.theta);
        
        //now rotate this orbital
        p.x = this.x + (x * this.shellCos[i] + y * this.shellSin[i]);
        p.y = this.y + (y * this.shellCos[i] - x * this.shellSin[i]);
        p.trace();
    }
};

Sink.prototype.recycleParticle = function (p) {
    var dt = Math.random() * 0.1 - 0.05;
    p.x = this.x + Math.cos(this.theta + dt) * this.influenceRadius * this.sizeFactor;
    p.y = this.y + Math.sin(this.theta + dt) * this.influenceRadius * this.sizeFactor;
    p.vel.x = Math.cos(this.theta) * this.speed;
    p.vel.y = Math.sin(this.theta) * this.speed;
};

Sink.prototype.drawOrbitals = function (canvas, color) {
    var i;
    for (i = 0; i < this.orbitals.length; i += 1) {
        this.orbitals[i].draw(canvas, color);
    }
};

Sink.prototype.drawPulseRing = function (canvas, color) {
    var r = this.ringpulsedt * this.radius * 0.05,
        alpha = 1 - this.ringpulsedt / this.ringpulselength;
    canvas.circleOutline(this.x, this.y, r, 10, [255, 255, 255], alpha * 0.15);
    canvas.circleOutline(this.x, this.y, r, 20, color, alpha * 0.25);
};

Sink.prototype.tonemap = function (n) {
    var exposure = 1.0;
    return (1 - Math.pow(2, -n * 0.005 * exposure)) * 255;
};

function contrastColor(color, contrast) {

    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    color[0] = 1 + (factor * ((color[0] - 128) + 128));
    color[1] = 1 + (factor * ((color[1] - 128) + 128));
    color[2] = 1 + (factor * ((color[2] - 128) + 128));
    
    return color;
}

function brighten(color, factor) {
    var c = [0, 0, 0], intensity = 10;
    c[0] = color[0] + intensity * 0.2126 * factor;
    c[1] = color[1] + intensity * 0.7152 * factor;
    c[2] = color[2] + intensity * 0.0722 * factor;

    c[0] = Math.min(255, ~~c[0]);
    c[1] = Math.min(255, ~~c[1]);
    c[2] = Math.min(255, ~~c[2]);

    return c;
}

Sink.prototype.drawGrabber = function (canvas, color, alpha) {
    var size = this.radius,
        dt1 = 0.3,
        p1 = new Vector(this.x + Math.cos(this.theta + dt1) * this.influenceRadius * this.sizeFactor,
                        this.y + Math.sin(this.theta + dt1) * this.influenceRadius * this.sizeFactor),
        p2 = new Vector(this.x + Math.cos(this.theta - dt1) * this.influenceRadius * this.sizeFactor,
                        this.y + Math.sin(this.theta - dt1) * this.influenceRadius * this.sizeFactor);

    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.radius * 0.5,
                          this.radius * 2,
                          color,
                          color,
                          0.5 * alpha,
                          0);
    canvas.circle(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                  this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                  this.radius, color, alpha);
    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.radius * 0.25,
                          this.radius * 2.25,
                          [255, 255, 255],
                          color,
                          alpha,
                          0.0);
    canvas.arrowHead(p1, 50, -this.theta - dt1, color, alpha * 0.25);
    canvas.arrowHead(p1, 30, -this.theta - dt1, color, alpha * 0.5);
    canvas.arrowHead(p1, 20, -this.theta - dt1, [255, 255, 255], alpha * 0.5);
    canvas.arrowHead(p2, 50, -this.theta + dt1 + Math.PI, color, alpha * 0.25);
    canvas.arrowHead(p2, 30, -this.theta + dt1 + Math.PI, color, alpha * 0.5);
    canvas.arrowHead(p2, 20, -this.theta + dt1 + Math.PI, [255, 255, 255], alpha * 0.5);
};

Sink.prototype.draw = function (canvas, color) {
    var maxHitAlpha = 0.15,
        hitFactor = 0.005,
        r = color[0],
        g = color[1],
        b = color[2],
        c = [r, g, b],
        intensity = 1000,
        i,
        radius,
        alpha,
        grabberAlpha;
    this.sizeFactor = 1 + this.radius * this.energy / 1000;

    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor,
                          this.radius * 4 * this.sizeFactor,
                          color,
                          color,
                          0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 2 * this.sizeFactor, c, 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor * 0.5,
                          this.radius * 1.5 * this.sizeFactor,
                          [255, 255, 255],
                          color,
                          1.0,
                          0.0);

    if (this.showInfluenceRing) {
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, [255, 255, 255], 1);
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, c, 1);
    }

    if (this.lockedIn && this.isSource) {
        //draw a pulsing outer ring to indicate this sink has been locked in
        radius = this.radius * this.sizeFactor;
        alpha = this.grabberFadeDt / this.grabberFadeLength;
        canvas.radialGradient(this.x,
                              this.y,
                              this.radius * this.sizeFactor,
                              this.influenceRadius * this.sizeFactor * 1.5,
                              [255, 255, 255],
                              color,
                              0.5 * alpha,
                              0.0);
        
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 20, [255, 255, 255], 0.3 * alpha);
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 5, color, 0.5 * alpha);
        
        this.drawGrabber(canvas, color, alpha);
    
    } else {
        //draw pulse ring...
        //this.drawPulseRing(canvas, color);
        if (this.flashdt >= 0 && this.flashdt < this.flashlength) {
            alpha = this.getOrbitalShell() / this.maxOrbitals * 0.75;
            alpha *= Math.sin(this.flashdt / this.flashlength * Math.PI) * 0.5;
            canvas.radialGradient(this.x,
                                  this.y,
                                  this.radius * this.sizeFactor * 1.25,
                                  this.influenceRadius * this.sizeFactor * 1.25,
                                  [255, 255, 255],
                                  color,
                                  alpha,
                                  0.0);
        }

        radius = (1 - this.ringpulsedt / this.ringpulselength) * this.radius * this.sizeFactor;
        alpha = this.ringpulsedt / this.ringpulselength;
        alpha = Math.sin(alpha * Math.PI);
        if (alpha < 0.001) {
            alpha = 0.001;
        }
        canvas.radialGradient(this.x,
                              this.y,
                              radius,
                              radius * 10,
                              [255, 255, 255],
                              color,
                              0.5 * alpha,
                              0.0);
        
        canvas.circleOutline(this.x, this.y, radius * 7, 10, [255, 255, 255], 0.3 * alpha);
        canvas.circleOutline(this.x, this.y, radius * 7, 3, color, 0.5 * alpha);
    }

    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }

    this.drawOrbitals(canvas, c);
};


Sink.prototype.serialize = function () {
    var obj = {};
    obj.x = this.x;
    obj.y = this.y;
    obj.radius = this.radius;
    obj.influenceRadius = this.influenceRadius;
    obj.force = this.force;
    obj.isSource = this.isSource;
    return obj;
};

var sinkFromJson = function (j) {
    return new Sink(j.x, j.y, j.radius, j.force, j.isSource);
};


