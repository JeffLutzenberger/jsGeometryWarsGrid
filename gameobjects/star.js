'use strict';

var StarLine = function (x, y, l) {
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
    this.age = 0;
    this.maxAge = 5000;
    this.vel = new Vector(0, 0);
    this.rotationSpeed = 0.01;
    this.speed = 0.1;
    this.age = 0;
    this.maxAge = 5000;
    this.theta = 0;
};

StarLine.prototype = {
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
    }
};

var StarTypes = ["diamond",
                 "double diamond",
                 "astrix",
                 "windmill",
                 "gear",
                 "saw",
                 "fourcircles",
                 "target",
                 "jellyfish"];

var Star = function (x, y, r, force, starType) {
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.starType = starType || StarTypes[0];
    this.influenceRadius = this.radius * 4;
    this.sizeFactor = 1;
    this.maxSizeFactor = 1.10;
    this.showInfluenceRing = true;
    this.hitsThisFrame = 0;
    this.hitsToDecay = 0;
    this.hitAlpha = 0;
    this.maxHitAlpha = 0.15;
    this.growthFactor = 0.005;
    this.decayFactor = 0.001;
    this.pulsedt = 0;
    this.pulselength = 2000;
    this.energy = 0;
    this.maxEnergy = 50.0;
    this.doorEnergy = 0;
    this.doorOpen = false;
    this.explode = false;
    this.exploded = false;
    this.explodedt = 0;
    this.growthFactor = 0.15;
    this.explosion = new ParticleSystem(x, y);
    this.explosion.init(x, y, 100, 10);
    this.animationTheta = 0;
    this.lines = [];
    //allow some stars to put down a doorway between grid walls...
    this.particleconfigs = {
        x : 768 * 0.5,
        y : 1024 * 0.5,
        particleradius : 5,
        particlelength : 50,
        nparticles : 300,
        nburstparticles: 50,
        burstradius : 50,
        speed : 0.6,
        accel : -0.0005,
        ntracers : 10,
        lifetime : 1000
    };
};

Star.prototype = new Rectangle();

/*
 * Actually we should be able to hand this function a "diamond" 
 * and get build the lines that way...not sure where we should 
 * do this though
 * */
Star.prototype.createStarPieces = function () {
    //canvas.diamond(this.x, this.y, w, h, 0, 10, color, 0.5);
    var w = this.radius,
        h = this.radius * 1.5,
        p1 = new Vector(w * 0.5, 0),
        p2 = new Vector(0, h * 0.5),
        p3 = new Vector(-w * 0.5, 0),
        p4 = new Vector(0, -h * 0.5),
        x, y, c, l, v;
    p1.x += this.x;
    p1.y += this.y;
    p2.y += this.x;
    p2.y += this.y;
    p3.y += this.x;
    p3.y += this.y;
    p4.y += this.x;
    p4.y += this.y;

    x = (p1.x + p2.x) * 0.5;
    y = (p1.x + p2.x) * 0.5;
    v = new Vector(p2.x - p1.x, p2.y - p1.y);
    l = VectorMath.length(v);    
    this.lines.push(new StarLine(x, y, l));
    x = (p2.x + p3.x) * 0.5;
    y = (p2.x + p3.x) * 0.5;
    v = new Vector(p3.x - p2.x, p3.y - p2.y);
    l = VectorMath.length(v); 
    this.lines.push(new StarLine(x, y, l));
    x = (p3.x + p4.x) * 0.5;
    y = (p3.x + p4.x) * 0.5;
    v = new Vector(p4.x - p3.x, p4.y - p3.y);
    l = VectorMath.length(v); 
    this.lines.push(new StarLine(x, y, l));
    x = (p4.x + p1.x) * 0.5;
    y = (p4.x + p1.x) * 0.5;
    v = new Vector(p1.x - p4.x, p1.y - p4.y);
    l = VectorMath.length(v); 
    this.lines.push(new StarLine(x, y, l));
    
    this.lines.push(new StarLine(this.x, this.y, 100));
    //console.log(this.lines);
};


Star.prototype.gameObjectType = function () {
    return "Star";
};

Star.prototype.setRadius = function (val) {
    this.radius = val;
    this.influenceRadius = val * 5;
    this.w = val;
    this.h = val;
};

Star.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <=  this.radius * this.radius * this.sizeFactor * this.sizeFactor);
};

Star.prototype.insideInfluenceRing = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength(),
        r = this.influenceRadius *this.sizeFactor;
    return (d2 <=  r * r);
};

Star.prototype.startExplosion = function () {
    var i, n, l, d = new Diamond(this.x,
                                 this.y,
                                 this.radius * 2 * this.sizeFactor,
                                 this.radius * 2 * 1.5 * this.sizeFactor,
                                 this.theta);
    this.lines = d.explode(0.01, 0.001);
};

Star.prototype.updateExplosion = function (dt) {
    var i;
    for (i = 0; i < this.lines.length; i += 1) {
        this.lines[i].update(dt);
    }
};

Star.prototype.update = function (dt, hit) {
    //this.doorEnergy = Math.max(0, this.doorEnergy - this.doorEnergy * this.decayFactor * dt);
    //console.log(this.doorEnergy);
    if (this.exploded && this.doorEnergy > this.maxEnergy * 0.8 && this.doorOpen === false) {
        console.log("open door");
        this.doorOpen = true;
        //send open door message
        $(document).trigger('opendoor');
    }
    //} else if (this.exploded && this.doorEnergy < this.maxEnergy * 0.5 && this.doorOpen === true) {
    //    console.log("close door");
    //    this.doorOpen = false;
    //    //send close door message
    //    $(document).trigger('closedoor');
    //}

    this.brightness = Math.min(this.brightness, 1.0);
    this.animationTheta += 0.001 * dt;

    if (this.animationTheta > Math.PI * 2) {
        this.animationTheta = 0.0;
    }
    
    if (this.energy >= this.maxEnergy * 0.9 && this.explode === false) {
        console.log("explode");
        this.explode = true;
        this.exploded = true;
        //this.startExplosion();
        this.explosion.init(this.x,
                            this.y,
                            this.particleconfigs.particleradius,
                            this.particleconfigs.particlelength,
                            this.particleconfigs.ntracers,
                            this.particleconfigs.nparticles);

        this.explosion.burst(this.x,
                             this.y,
                             this.particleconfigs.burstradius,
                             this.particleconfigs.speed,
                             this.particleconfigs.accel,
                             this.particleconfigs.nburstparticles,
                             this.particleconfigs.lifetime);

    }

    if (this.explode === true) {
        //this.updateExplosion(dt);
        this.explodedt += dt;
        this.explosion.update(dt);
    }

    this.pulsedt += dt;
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Star.prototype.addEnergy = function () {
    this.energy += this.growthFactor;
    //this.flash = true;
    if (this.energy > this.maxEnergy) {
        this.energy = this.maxEnergy;
    }
    //if (this.getOrbitalShell() > this.orbitals.length) {
    //    this.addOrbital();
    //}

};

Star.prototype.addDoorEnergy = function () {
    this.doorEnergy += this.growthFactor;
    if (this.doorEnergy > this.maxEnergy) {
        this.doorEnergy = this.maxEnergy;
    }
};

Star.prototype.drawExplosion = function (canvas, color) {
    //send lines outward and give them some rotation
    var i, l;
    for (i = 0; i < this.lines.length; i += 1) {
        this.lines[i].draw(canvas, color);
    }
};

Star.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        radius = this.radius,
        alpha = 1.0,
        w = this.radius,
        h = this.radius;

    this.sizeFactor = 1 + this.energy / this.maxEnergy * this.maxSizeFactor;
       
    if (this.exploded) {
        //alpha = 0.70;
        this.sizeFactor = 1 + this.maxSizeFactor;
    } else {
        alpha = 0.75;
    }

    if (this.explode === true) {
        //this.drawExplosion(canvas, color)
        this.explosion.draw(canvas, color);
    }

    alpha = this.energy / this.maxEnergy;
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor,
                          this.radius * this.sizeFactor * 4,
                          color,
                          color,
                          alpha * 0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * this.sizeFactor * 2, color, alpha * 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor * 0.5,
                          this.radius * this.sizeFactor * 1.5,
                          [255, 255, 255],
                          color,
                          alpha,
                          0.0);
    canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, [255, 255, 255], 0.5);
    canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, color, 0.75);

    w *= 3 * this.sizeFactor;
    h *= 3 * this.sizeFactor;
    
    if (this.starType === StarTypes[0]) {
        w += Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * w * 0.25;
        h -= Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * h * 0.25;
        this.drawDiamond(w, h, canvas, color);
    } else if (this.starType === StarTypes[1]) {
        w += Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * w * 0.25;
        h -= Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * h * 0.25;
        this.drawDoubleDiamond(w, h, canvas, color);
    } else if (this.starType === StarTypes[2]) {
        w += Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * w * 0.25;
        h -= Math.sin(this.pulsedt / this.pulselength * Math.PI * 2) * h * 0.25;
        this.drawAstrix(w, h, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[3]) {
        this.drawWindmill(w, h, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[4]) {
        this.drawGear(w * 0.65, w * 0.8, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[5]) {
        this.drawSaw(w * 0.65, w * 0.8, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[6]) {
        this.drawFourCircles(w, w * 0.8, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[7]) {
        this.drawTarget(w, this.animationTheta, canvas, color);
    } else if (this.starType === StarTypes[8]) {
        this.drawJellyfish(w, w * 0.8, this.animationTheta, canvas, color);
    }
};

Star.prototype.drawDiamond = function (w, h, canvas, color) {
    canvas.diamond(this.x, this.y, w, h, 0, 10, color, 0.5);
    canvas.diamond(this.x, this.y, w, h, 0, 5, color, 1.0);
    canvas.diamond(this.x, this.y, w, h, 0, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawDoubleDiamond = function (w, h, canvas, color) {
    canvas.diamond(this.x, this.y, w, h, 0, 10, color, 0.5);
    canvas.diamond(this.x, this.y, w, h, 0, 5, color, 1.0);
    canvas.diamond(this.x, this.y, w, h, 0, 2, [255, 255, 255], 0.9);
    canvas.diamond(this.x, this.y, h, w, 0, 10, color, 0.5);
    canvas.diamond(this.x, this.y, h, w, 0, 5, color, 1.0);
    canvas.diamond(this.x, this.y, h, w, 0, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawAstrix = function (w, h, theta, canvas, color) {
    canvas.astrix(this.x, this.y, w, h, theta, 10, color, 0.5);
    canvas.astrix(this.x, this.y, w, h, theta, 5, color, 1.0);
    canvas.astrix(this.x, this.y, w, h, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawWindmill = function (w, h, theta, canvas, color) {
    canvas.windmill(this.x, this.y, w, h, theta, 10, color, 0.5);
    canvas.windmill(this.x, this.y, w, h, theta, 5, color, 1.0);
    canvas.windmill(this.x, this.y, w, h, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawGear = function (rin, rout, theta, canvas, color) {
    canvas.gear(this.x, this.y, rin, rout, theta, 8, color, 0.5);
    canvas.gear(this.x, this.y, rin, rout, theta, 5, color, 1.0);
    canvas.gear(this.x, this.y, rin, rout, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawSaw = function (rin, rout, theta, canvas, color) {
    canvas.saw(this.x, this.y, rin, rout, theta, 8, color, 0.5);
    canvas.saw(this.x, this.y, rin, rout, theta, 5, color, 1.0);
    canvas.saw(this.x, this.y, rin, rout, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawFourCircles = function (rin, rout, theta, canvas, color) {
    canvas.fourcircles(this.x, this.y, rin, theta, 8, color, 0.5);
    canvas.fourcircles(this.x, this.y, rin, theta, 5, color, 1.0);
    canvas.fourcircles(this.x, this.y, rin, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.drawTarget = function (r, theta, canvas, color) {
    canvas.target(this.x, this.y, r, theta, 8, color, 0.5);
    canvas.target(this.x, this.y, r, theta, 5, color, 1.0);
    canvas.target(this.x, this.y, r, theta, 2, [255, 255, 255], 0.9);
};


Star.prototype.drawJellyfish = function (w, h, theta, canvas, color) {
    canvas.jellyfish(this.x, this.y, w, theta, 8, color, 0.5);
    canvas.jellyfish(this.x, this.y, w, theta, 4, color, 1.0);
    canvas.jellyfish(this.x, this.y, w, theta, 2, [255, 255, 255], 0.9);
};

Star.prototype.serialize = function () {
    var obj = {};
    obj.x = this.x;
    obj.y = this.y;
    obj.radius = this.radius;
    obj.influenceRadius = this.influenceRadius;
    obj.force = this.force;
    obj.starType = this.starType;
    return obj;
};

var starFromJson = function (j) {
    return new Star(j.x, j.y, j.radius, j.force, j.starType);
};


