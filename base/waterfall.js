'use strict';

var ParticleWorld = function (canvas, grid) {
    this.canvas = canvas;
    this.grid = grid;
    this.stars = [];
    this.sources = [];
    this.sinks = [];
    this.stars = [];
    this.influencers = [];
    this.portals = [];
    this.buckets = [];
    this.obstacles = [];
    this.particles = [];
    this.sinkIsSource = false;
    this.localizeInfluence = true;
    this.nParticles = 0;
    this.score = 0;
    this.flux = 0;
    this.sumFlux = 0;
    this.missed = 0;
    this.level = 1;
    this.framerate = 30; //fps (how often we draw)
    this.dt = 0;
    this.drawDt = 0;
    this.frame = 0;
    this.interactableObjects = [];
    this.interactable = null;
    this.mouseDown = false;
    this.showGrid = false;
    this.gridx = 24;
    this.gridy = 16;
    this.forceMultiplier = 1e4;
    this.maxParticleSpeed = 2;
    this.maxParticleAge = 500;
    this.minDSquared = 1000;
    this.particleColor = [0, 153, 255];
    this.blueColor = [0, 153, 255];
    this.greenColor = [0, 153, 153];
    this.sourceColor = [100, 255, 100];
    this.sinkColor =  [0, 255, 0];
    this.starColor =  [255, 150, 200];
    this.influencerColor = [0, 153, 255];
    this.obstacleColor = [100, 100, 255];
    this.bucketColor = [0, 153, 255];
    this.gridColor = [200, 50, 255];
    this.portalColor = [255, 153, 0];
    this.scoreTextColor = [100, 100, 100];
    this.backgroundGrid = new BackgroundGrid(768, 1024, 768 / 16, 1024 / 16);
    this.traileffect = new TrailEffect(canvas);

    canvas.electricityLine(new Vector(100, 100), new Vector(100, 500), 30, 10, [100, 100, 255], 1.0);
};

ParticleWorld.prototype = {
   
    setHandlers: function () {
        $(document).bind('levelup', $.proxy(function (e) {
            //this.levelUp();
        }, this));
    },

    clear: function () {
        this.stars.length = 0;
        this.sources.length = 0;
        this.sinks.length = 0;
        this.stars.length = 0;
        this.influencers.length = 0;
        this.portals.length = 0;
        this.buckets.length = 0;
        this.obstacles.length = 0;
        this.particles.length = 0;
        this.interactableObjects.length = 0;
    },

    update: function (dt) {
        var i = 0, color, p, f = 1, o;

        this.dt = dt;

        this.calculateFlux();

        this.backgroundGrid.update(dt);

        for (i = 0; i < this.sinks.length; i += 1) {
            //this.sinks[i].update(dt);
            o = this.sinks[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 5, new Vector(o.x, o.y), o.radius * 10);

        }

        for (i = 0; i < this.stars.length; i += 1) {
            //this.stars[i].update(dt);
            o = this.stars[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 5, new Vector(o.x, o.y), o.radius * 10);

        }
        
        for (i = 0; i < this.influencers.length; i += 1) {
            o = this.influencers[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 6, new Vector(o.x, o.y), o.radius * 10);
        }

        if ((this.sinkIsSource && this.sinks.length > 0) || this.sources.length > 0) {
            if (this.particles.length < this.nParticles) {
                this.addParticle();
            }
            this.moveParticles(dt);
        }

        //for (i = 0; i < this.particles.length; i += 1) {
        //    //probably want to set a sample rate here (limit the number of particles we use)
        //    this.traileffect.update(dt, this.particles[i]);
        //}
    },
    
    calculateFlux : function () {
        var i;
        this.frame += 1;
        if (this.frame > 1e6) {
            this.frame = 1e6;
        }

        if (this.frame % this.framerate * 2 === 0) {
            this.flux = this.sumFlux;
            this.sumFlux = 0;
        }
    },

    addParticle : function () {
        var i = Math.floor(Math.random() * this.sources.length), p1, p2,
            v, x, y, p, s, dt = Math.random() * 0.4 - 0.2;
        if (this.sinkIsSource) {
            p = new Particle(x, y);
            this.sinks[0].recycleParticle(p);
            p.recycle(p.x, p.y, p.vel.x, p.vel.y);
        } else {
            p1 = this.sources[i].p3;
            p2 = this.sources[i].p4;
            v = new Vector(p2.x - p1.x, p2.y - p1.y);
            x = p1.x + Math.random() * v.x;
            y = p1.y + Math.random() * v.y;
            p = new Particle(x, y);
            p.vel.x = this.sources[i].v * this.sources[i].n3.x;
            p.vel.y = this.sources[i].v * this.sources[i].n3.y;
        }
        this.particles[this.particles.length] = p;
    },

    recycleParticle: function (p) {
        var i = Math.floor(Math.random() * this.sources.length), p1, p2,
            v, x, y, vx, vy, s, dt = Math.random() * 0.4 - 0.2;
        if (this.sinkIsSource) {
            this.sinks[0].recycleParticle(p);
            p.recycle(p.x, p.y, p.vel.x, p.vel.y);
        } else {
            p1 = this.sources[i].p3;
            p2 = this.sources[i].p4;
            v = new Vector(p2.x - p1.x, p2.y - p1.y);
            x = p1.x + Math.random() * v.x;
            y = p1.y + Math.random() * v.y;
            vx = this.sources[i].v * this.sources[i].n3.x;
            vy = this.sources[i].v * this.sources[i].n3.y;
            p.recycle(x, y, vx, vy);
        }
    },

    moveParticles: function (dt) {
        var i = 0;
        for (i = 0; i < this.particles.length; i += 1) {
            this.moveParticle(this.particles[i], dt);
        }
    },

    moveParticle: function (particle, dt) {
             
        particle.move(dt);
        
        particle.trace();

        this.hitSinks(particle);

        this.hitStars(particle);

        this.hitInfluencers(particle);
 
        this.hitObstacles(particle, dt);

        this.hitBuckets(particle);

        this.hitPortals(particle);

        this.hitGridWall(particle, dt);

        if (particle.age > this.maxParticleAge) {
            this.missed += 1;
            this.recycleParticle(particle);
        }
    },

    hitObstacles: function (p, dt) {
        var i, o, h, dot;
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            h = o.hit(p);
            if (h) {
                if (o.reaction > 0) {
                    p.bounce(h);
                } else {
                    this.recycleParticle(p);
                }
                p.move(dt);
                return true;
            }
        }
        return false;
    },

    hitBuckets: function (p) {
        var i, b;
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            if (b.hit(p)) {
                this.score += 1;
                this.sumFlux += 1;
                this.recycleParticle(p);
                return true;
            }
        }
        return false;
    },

    hitInfluencers: function (p) {
        var i, v2, d2, res, influencer;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            if (this.localizeInfluence && !this.grid.sameTile(influencer, p)) {
                    continue;
            }
            influencer.influence(p, this.maxParticleSpeed);
        }
        return false;
    },

    hitSinks: function (p) {
        var i, s, d2, v2, res, hit = false, dt = Math.random() * 0.4 - 0.2;
        for (i = 0; i < this.sinks.length; i += 1) {
            s = this.sinks[i];
            if (this.localizeInfluence && !this.grid.sameTile(s, p)) {
                    continue;
            }

            if (s.influenceBound && !s.insideInfluenceRing(p)) {
                continue;
            }

            if (s.hit(p)) {
                if (s.lockedIn && s.isSource) {
                    s.recycleParticle(p);
                    p.brightness += 0.1;
                    p.age = 0;
                    return false;
                } else {
                    this.recycleParticle(p);
                    s.addEnergy();
                    return true;
                }
            }

            v2 = new Vector(s.x - p.x, s.y - p.y);
            d2 = v2.squaredLength();
            res = s.force * this.forceMultiplier * s.sizeFactor / d2;
            res = Math.min(res, this.maxParticleSpeed);
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(res);
            p.vel.x += v2.x;
            p.vel.y += v2.y;
        }
        return false;
    },

    hitStars: function (p) {
        var i, s, d2, v2, res, hit = false, dt = Math.random() * 0.4 - 0.2;
        for (i = 0; i < this.stars.length; i += 1) {
            s = this.stars[i];
            if (this.localizeInfluence) {
                //check that particle and object are in the same tile piece
                if (!this.grid.sameTile(s, p)) {
                    continue;
                }
            }

            if (!s.exploded && s.hit(p)) {
                //flash and increment energy
                s.addEnergy();
                this.recycleParticle(p);
                return true;
            }
            if (s.insideInfluenceRing(p)) {
                //add door energy
                s.addDoorEnergy();
            }
            v2 = new Vector(s.x - p.x, s.y - p.y);
            d2 = v2.squaredLength();
            res = s.force * this.forceMultiplier * s.sizeFactor * s.energy / s.maxEnergy / d2;
            res = Math.min(res, this.maxParticleSpeed);
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(res);
            p.vel.x += v2.x;
            p.vel.y += v2.y;
        }
        return false;
    },

    hitInteractable: function (x, y, checkall) {
        var i, p = new Particle(x, y);
        p.radius = 50;
        if (this.interactable) {
            this.interactable.selected = false;
            this.interactable.grabberSelected = false;
            this.interactable = undefined;
        }
        
        for (i = 0; i < this.sinks.length; i += 1) {
            this.sinks[i].grabberSelected = false;
        }

        for (i = 0; i < this.sinks.length; i += 1) {
            if (this.sinks[i].lockedIn && this.sinks[i].hitGrabber(p)) {
                this.interactable = this.sinks[i];
                this.interactable.grabberSelected = true;
                this.interactable.selected = true;
                return true;
            }
        }

        //checkall means we're in edit mode and we should check all objects...
        if (checkall) {
            for (i = 0; i < this.sinks.length; i += 1) {
                if (this.sinks[i].bbHit(p)) {
                    this.interactable = this.sinks[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
            
            for (i = 0; i < this.obstacles.length; i += 1) {
                if (this.obstacles[i].bbHit(p)) {
                    this.interactable = this.obstacles[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.stars.length; i += 1) {
                if (this.stars[i].bbHit(p)) {
                    this.interactable = this.stars[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
            for (i = 0; i < this.influencers.length; i += 1) {
                if (this.influencers[i].bbHit(p)) {
                    this.interactable = this.influencers[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.sources.length; i += 1) {
                if (this.sources[i].bbHit(p)) {
                    this.interactable = this.sources[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.buckets.length; i += 1) {
                if (this.buckets[i].bbHit(p)) {
                    this.interactable = this.buckets[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.portals.length; i += 1) {
                if (this.portals[i].bbHit(p)) {
                    this.interactable = this.portals[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.grid.lines.length; i += 1) {
                //console.log(this.grid.lines[i]);
                //console.log(p);
                if (this.grid.lines[i].circleHit(p)) {
                    this.interactable = this.grid.lines[i];
                    this.interactable.selected = true;
                    console.log(this.interactable);
                    return true;
                }
            }
        } else {
            for (i = 0; i < this.interactableObjects.length; i += 1) {
                if (this.interactableObjects[i].bbHit(p)) {
                    this.interactable = this.interactableObjects[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
        }
        return false;
    },

    hitPortals: function (p) {
        var i, c;
        for (i = 0; i < this.portals.length; i += 1) {
            if (this.portals[i].hit(p)) {
                return true;
            }
        }
        return false;
    },

    hitGridWall: function (p, dt) {
        //where is the particle...
        //i.e. get the grid rect that the particle is in
        var h = this.grid.hit(p);
        if (h) {
            p.bounce(h);
            p.move(dt);
            return true;
        }
        return false;
    },

    drawBackground: function (dt) {
        //this.backgroundeffect.update(dt);
        //this.backgroundeffect.draw(this.canvas);
        //this.canvas.ctx.drawImage(this.traileffect.getCanvas(), -768 * 3 * 0.5, -1024 * 3 * 0.5, 768 * 3, 1024 * 3);
    },

    drawParticles : function () {
        var i = 0, color = this.particleColor;
        for (i = 0; i < this.particles.length; i += 1) {
            this.particles[i].draw(this.canvas, color);
        }
    },

    drawSources : function () {
        var i, o, color = this.sourceColor;
        for (i = 0; i < this.sources.length; i += 1) {
            this.sources[i].draw(this.canvas, color);
        }
    },

    drawSinks : function (dt) {
        var i = 0, color = this.sinkColor;
        for (i = 0; i < this.sinks.length; i += 1) {
            this.sinks[i].draw(this.canvas, color, dt);
        }
    },

    drawStars : function (dt) {
        var i = 0, color = this.starColor;
        for (i = 0; i < this.stars.length; i += 1) {
            this.stars[i].draw(this.canvas, color, dt);
        }
    },

    drawInfluencers : function (dt) {
        var i = 0, color = this.influencerColor;
        for (i = 0; i < this.influencers.length; i += 1) {
            this.influencers[i].draw(this.canvas, color, dt);
        }
    },

    drawBuckets : function () {
        var i, b, alpha = Math.min(this.score / 1000 + 0.25, 1),
            color = this.bucketColor;
        for (i = 0; i < this.buckets.length; i += 1) {
            this.buckets[i].draw(this.canvas, color);
        }
    },

    drawObstacles : function () {
        var i, o, color = this.obstacleColor;
        for (i = 0; i < this.obstacles.length; i += 1) {
            this.obstacles[i].draw(this.canvas, color);
        }
    },

    drawPortals : function () {
        var i, c, color = this.portalColor;
        for (i = 0; i < this.portals.length; i += 1) {
            this.portals[i].draw(this.canvas, color);
        }
    },

    drawGridWalls : function () {
        var color = this.gridColor;
        this.grid.draw(this.canvas, color);
    },
   
    drawBackgroundGrid : function () {
        var color = this.gridColor;
        this.backgroundGrid.draw(this.canvas, color);
    },
    
    drawScore : function () {
        var i, b, color = this.scoreTextColor,
            fontFamily = 'arial', fontSize = 16, str;
        str = "caught " + this.score;
        this.canvas.text(50, 50, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(50, 100, color, fontFamily, fontSize, str);
        str = "flux " + parseInt(this.flux, 10);
        this.canvas.text(50, 150, color, fontFamily, fontSize, str);
    },

    draw: function (dt) {
        this.drawBackground(dt);

        this.drawBackgroundGrid();

        this.drawParticles();

        this.drawSources();

        this.drawSinks(dt);
        
        this.drawStars(dt);
    
        this.drawObstacles();
    
        this.drawPortals();
    
        this.drawInfluencers(dt);

        this.drawBuckets();

        this.drawGridWalls();

        //this.drawScore();
    }
};
