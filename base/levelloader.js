'use strict';

var LevelLoader = {
    load: function (waterfall, level, x, y) {
        var i = 0,
            starList = level.stars,
            sourceList = level.sources,
            sinkList = level.sinks,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            width = 0,
            p;

        x = x || 0;
        y = y || 0;

        waterfall.clear();
            
        waterfall.nParticles = level.nParticles;

        for (i = 0; i < starList.length; i += 1) {
            waterfall.stars[i] = starFromJson(starList[i]);
            waterfall.stars[i].x += x;
            waterfall.stars[i].y += y;
            waterfall.stars[i].updatePoints();

        }

        for (i = 0; i < sourceList.length; i += 1) {
            waterfall.sources[i] = sourceFromJson(sourceList[i]);
            waterfall.sources[i].x += x;
            waterfall.sources[i].y += y;
            waterfall.sources[i].updatePoints();
        }

        for (i = 0; i < sinkList.length; i += 1) {
            waterfall.sinks[i] = sinkFromJson(sinkList[i]);
            waterfall.sinks[i].x += x;
            waterfall.sinks[i].y += y;
            waterfall.sinks[i].updatePoints();
            if (waterfall.sinkIsSource) {
                waterfall.sinks[i].lockedIn = true;
            }
        }

        for (i = 0; i < influencerList.length; i += 1) {
            waterfall.influencers[i] = influencerFromJson(influencerList[i]);
            waterfall.influencers[i].x += x;
            waterfall.influencers[i].y += y;
            waterfall.influencers[i].updatePoints();
            waterfall.interactableObjects[i] = waterfall.influencers[i];
        }

        for (i = 0; i < portalList.length * 2; i += 2) {
            p = portalFromJson(portalList[i]);
            waterfall.portals[i] = p[0];
            waterfall.portals[i + 1] = p[1];
            waterfall.portals[i].x += x;
            waterfall.portals[i].y += y;
            waterfall.portals[i].updatePoints();
            waterfall.portals[i + 1].x += x;
            waterfall.portals[i + 1].y += y;
            waterfall.portals[i + 1].updatePoints();
        }

        for (i = 0; i < bucketList.length; i += 1) {
            waterfall.buckets[i] = new bucketFromJson(bucketList[i], x, y);
            waterfall.buckets[i].x += x;
            waterfall.buckets[i].y += y;
            waterfall.buckets[i].updatePoints();
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            waterfall.obstacles[i] = new obstacleFromJson(obstacleList[i], x, y);
            waterfall.obstacles[i].x += x;
            waterfall.obstacles[i].y += y;
            waterfall.obstacles[i].updatePoints();
        }
    },
    
    addLevel: function (waterfall, level, x, y) {
        var i = 0,
            starList = level.stars,
            sourceList = level.sources,
            sinkList = level.sinks,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            width = 0,
            p,
            o;

        x = x || 0;
        y = y || 0;

        for (i = 0; i < starList.length; i += 1) {
            o = starFromJson(starList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.stars.push(o);
        }
        
        for (i = 0; i < sourceList.length; i += 1) {
            o = sourceFromJson(sourceList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.sources.push(o);
        }

        for (i = 0; i < sinkList.length; i += 1) {
            o = sinkFromJson(sinkList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            o.levelUpCallback = $.proxy(waterfall.levelUp, this);
            waterfall.sinks.push(o);
        }

        for (i = 0; i < influencerList.length; i += 1) {
            o = influencerFromJson(influencerList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.influencers.push(o);
            waterfall.interactableObjects.push(o);
        }

        for (i = 0; i < portalList.length * 2; i += 2) {
            p = portalFromJson(portalList[i]);
            o = p[0];
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.portals.push(o);
            o = p[1];
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.portals.push(o);
        }

        for (i = 0; i < bucketList.length; i += 1) {
            o = new bucketFromJson(bucketList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.buckets.push(o);
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            o = new obstacleFromJson(obstacleList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            waterfall.obstacles.push(o);
        }
    },

    levelUp: function (waterfall) {
        //add a sink and a few influencers
        //influencers should be clustered near our sinks
        //
        var locs = [[-768 * 1.5, -1024 * 1.5],
                    [-768 * 0.5, -1024 * 1.5],
                    [768 * 0.5, -1024 * 1.5],
                    [768 * 0.5, -1024 * 0.5],
                    [768 * 0.5, 1024 * 0.5]],
            x,
            y,
            obj;

        if (waterfall.level > locs.length) {
            return;
        }
        
        x = locs[waterfall.level][0];
        y = locs[waterfall.level][1];

        waterfall.addLevel(levels[this.level], x, y);

        waterfall.level += 1;

    },

    saveLevel: function (waterfall) {
        var i, level = {};
        level.nParticles = waterfall.nParticles;
        level.buckets = waterfall.buckets;
        level.influencers = waterfall.influencers;
        level.obstacles = waterfall.obstacles;
        level.portals = waterfall.portals;
        level.stars = [];
        level.sinks = [];
        for (i = 0; i < waterfall.stars.length; i += 1) {
            level.stars.push(waterfall.stars[i].serialize());
        }
        for (i = 0; i < waterfall.sinks.length; i += 1) {
            console.log(waterfall.sinks[i]);
            level.sinks.push(waterfall.sinks[i].serialize());
        }
        level.sources = waterfall.sources;
        return level;
    }

};
