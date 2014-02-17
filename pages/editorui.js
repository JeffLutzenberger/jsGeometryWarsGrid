'use strict';

var EditorPage = function (canvas, hdim, vdim) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.grid = new Grid(768 * hdim, 1024 * vdim, 768, 1024);
    this.waterfall = new ParticleWorld(canvas, this.grid);
    this.grid = new Grid(768, 1024, 768 / 32, 1024 / 32);
    this.editorui = new EditorUI(this.waterfall);
    this.showGrid = false;
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(768 * 0.5, 1024 * 0.5);
};


EditorPage.prototype = {

    init: function () {
        var obj;
        this.waterfall.clear();
        obj = new Source(400, 50, 50, 25, 0, 5);
        this.waterfall.sources.push(obj);
        this.waterfall.interactableObjects.push(obj);
        obj = new Bucket(300, 600, 100, 50, 0);
        this.waterfall.buckets.push(obj);
        this.waterfall.interactableObjects.push(obj);
        obj = new Obstacle(300, 300, 100, 25, 45, 1);
        this.waterfall.obstacles.push(obj);
        this.waterfall.interactableObjects.push(obj);
    },

    hideUI: function () {
        this.editorui.hide();
    },

    showUI: function () {
        this.editorui.show();
    },

    setHandlers: function () {
        $('canvas').unbind();
        $(document).unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(p.x, p.y);
            this.editorui.gameObjectForm.gameObject = this.waterfall.interactable;
            this.editorui.gameObjectForm.hide();
            if (this.waterfall.interactable) {
                console.log(this.waterfall.interactable);
                this.editorui.gameObjectForm.show();
            }
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            if (this.waterfall.hitObject) {
                this.waterfall.hitObject.selected = false;
            }
            this.waterfall.hitObject = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.waterfall.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            x = this.grid.snapx(p.x);
            y = this.grid.snapy(p.y);

            if (this.waterfall.interactable.gameObjectType() === "Sink" && this.waterfall.interactable.grabberSelected) {
                //move the sinks grabber...
                this.waterfall.interactable.moveGrabber(p);
            } else if (this.waterfall.interactable) {
                this.waterfall.interactable.setxy(x, y);
                this.editorui.gameObjectForm.updateLocation();
            }

        }, this));

        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            //console.log(e.keyCode);
            switch (e.keyCode) {
            case 32: //space
                //toggle particles
                if (this.waterfall.nParticles <= 0 && this.waterfall.sources.length > 0) {
                    this.waterfall.nParticles = 50;
                } else {
                    this.waterfall.nParticles = 0;
                    this.waterfall.particles.length = 0;
                }
                break;
            case 98: //b
                obj = new Bucket(100, 400, 100, 50, 0);
                this.waterfall.buckets.push(obj);
                this.waterfall.interactableObjects.push(obj);
                this.editorui.selectObject(obj);
                break;
            case 105: //i
                obj = new Influencer(400, 100);
                this.waterfall.influencers.push(obj);
                this.waterfall.interactableObjects.push(obj);
                this.editorui.selectObject(obj);
                break;
            case 111: //o
                //add an obstacle
                obj = new Obstacle(100, 100, 100, 25, 0, 1);
                this.waterfall.obstacles.push(obj);
                this.waterfall.interactableObjects.push(obj);
                this.editorui.selectObject(obj);
                break;
            case 112: //p
                //add an obstacle
                obj = new Portal(300, 400, 100, 25, 0);
                obj2 = new Portal(200, 300, 100, 25, 0, obj);
                this.waterfall.portals.push(obj);
                this.waterfall.portals.push(obj2);
                this.waterfall.interactableObjects.push(obj);
                this.waterfall.interactableObjects.push(obj2);
                this.editorui.selectObject(obj);
                break;
            case 115: //s
                obj = new Source(200, 100, 100, 25, 0, 0, 0.5);
                this.waterfall.sources.push(obj);
                this.waterfall.interactableObjects.push(obj);
                this.editorui.selectObject(obj);
                break;
            default:
                break;
            }
        }, this));

        this.waterfall.setHandlers();

    },

    update: function (dt) {
        this.waterfall.update(dt);
        this.draw(dt);
    },

    draw: function (dt) {
        this.drawDt += dt;
        if (this.drawDt > this.framerate) {

            this.currentDrawTime = new Date().getTime();

            this.lastDrawTime = this.currentDrawTime;

            this.drawDt = 0;

            this.camera.reset();

            this.camera.show();

            if (this.editorui.showGrid) {
                this.grid.draw(this.canvas, [50, 50, 50]);
            }

            this.waterfall.draw();
        }
    }
};

var EditorUI = function (waterfall) {
    this.waterfall = waterfall;
    this.gameObjectForm = new GameObjectEditForm(waterfall);
    this.showGrid = false;
    this.showInfluenceRing = true;
};

EditorUI.prototype = {
    show: function () {
        var val;
        $("#editor-form").html('');
        $("#editor-form").off();

        $("#editor-form").append('<input id="bucket-button" type="button" value="Bucket">').button();
        $("#bucket-button").click($.proxy(function () {
            this.addBucket();
        }, this));

        $("#editor-form").append('&nbsp;<input id="influencer-button" type="button" value="Influencer">').button();
        $("#influencer-button").click($.proxy(function () {
            this.addInfluencer();
        }, this));

        $("#editor-form").append('&nbsp;<input id="obstacle-button" type="button" value="Obstacle">').button();
        $("#obstacle-button").click($.proxy(function () {
            this.addObstacle();
        }, this));

        $("#editor-form").append('&nbsp;<input id="portal-button" type="button" value="Portal">').button();
        $("#portal-button").click($.proxy(function () {
            this.addPortal();
        }, this));

        $("#editor-form").append('&nbsp;<input id="source-button" type="button" value="Source"><br><br>').button();
        $("#source-button").click($.proxy(function () {
            this.addSource();
        }, this));

        $("#editor-form").append('&nbsp;<input id="sink-button" type="button" value="Sink">').button();
        $("#sink-button").click($.proxy(function () {
            this.addSink();
        }, this));

        $("#editor-form").append('&nbsp;<input id="star-button" type="button" value="Star">').button();
        $("#star-button").click($.proxy(function () {
            this.addStar();
        }, this));

        $("#editor-form").append('&nbsp;<input id="play-button" type="button" value="Play">').button();
        $("#play-button").click($.proxy(function () {
            this.togglePlay();
        }, this));
        
        $("#editor-form").append('&nbsp;<input id="save-button" type="button" value="Save">').button();
        $("#save-button").click($.proxy(function () {
            this.save();
        }, this));

        $("#editor-form").append('&nbsp;<input id="reset-button" type="button" value="Reset">').button();
        $("#reset-button").click($.proxy(function () {
            this.reset();
            this.waterfall.backgroundGrid.applyExplosiveForce(5, new Vector(768 * 0.5, 1025 * 0.5), 512);
        }, this));

        $("#editor-form").append('<br><br>Tile-based Influence: <input id="localize-influence-input" type="checkbox"' + (this.waterfall.localizeInfluence ? "checked" : "") + '></span><br>');
        $("#localize-influence-input").change($.proxy(function () {
            val = $("#localize-influence-input").prop('checked');
            this.waterfall.localizeInfluence = val;
        }, this));

   
        /*$("#grid-button").append('<input type="button" value="Grid">')
            .button()
            .click($.proxy(function () {
                this.toggleGrid();
            }, this));

        $("#influence-ring-button").append('<input type="button" value="Influence Rings">')
            .button()
            .click($.proxy(function () {
                this.toggleInfluenceRings();
            }, this));
        */
    },

    hide: function () {
        $("#editor-form").html('');
        $("#editor-form").off();
        $("#object-form").html('');
        $("#object-form").off();
        $("#json").html('');
    },

    addBucket: function () {
        var obj = new Bucket(300, 500, 100, 50, 0);
        this.waterfall.buckets.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addInfluencer: function () {
        var obj = new Influencer(400, 100, 15, 0.5);
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.influencers.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addSink: function () {
        var obj = new Sink(400, 200, 15, 1);
        obj.lockedIn = true;
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.sinks.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addStar: function () {
        var obj = new Star(400, 200, 15, 1);
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.stars.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addObstacle: function () {
        var obj = new Obstacle(100, 100, 100, 25, 0, 1);
        this.waterfall.obstacles.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addPortal: function () {
        var obj = new Portal(300, 400, 100, 25, 0),
            obj2 = new Portal(200, 300, 50, 25, 0, obj);
        this.waterfall.portals.push(obj);
        this.waterfall.portals.push(obj2);
        this.waterfall.interactableObjects.push(obj);
        this.waterfall.interactableObjects.push(obj2);
        this.selectObject(obj);
    },

    addSource: function () {
        var obj = new Source(200, 100, 25, 25, 0, 5);
        this.waterfall.sources.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    togglePlay: function () {
        //toggle particles
        if (this.waterfall.nParticles <= 0) {
            this.waterfall.nParticles = 50;
        } else {
            this.waterfall.nParticles = 0;
            this.waterfall.particles.length = 0;
        }
    },

    toggleGrid: function () {
        this.showGrid = !this.showGrid;
    },

    toggleInfluenceRings: function () {
        var i = 0, o;
        this.showInfluenceRing = !this.showInfluenceRing;
        for (i = 0; i < this.waterfall.influencers.length; i += 1) {
            o = this.waterfall.influencers[i];
            o.showInfluenceRing = this.showInfluenceRing;
        }
        for (i = 0; i < this.waterfall.sinks.length; i += 1) {
            o = this.waterfall.sinks[i];
            o.showInfluenceRing = this.showInfluenceRing;
        }
    },

    reset: function () {
        this.waterfall.score = 0;
    },

    save: function () {
        //var json = JSON.stringify(this.waterfall.saveLevel(), undefined, 2);
        //var json = JSON.stringify(this.waterfall.saveLevel());
        var json = JSON.stringify(LevelLoader.saveLevel(this.waterfall));
        $('#json').html('<pre>' + json + '</pre>');
    },

    selectObject: function (o) {
        if (this.waterfall.interactable) {
            this.waterfall.interactable.selected = false;
        }
        this.waterfall.interactable = o;
        o.selected = true;
        this.gameObjectForm.gameObject = this.waterfall.interactable;
        this.gameObjectForm.hide();
        if (this.waterfall.interactable) {
            this.gameObjectForm.show();
        }
    }
};

var GameObjectEditForm = function (waterfall) {
    this.waterfall = waterfall;
    this.gameObject = null;
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPositiveNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n >= 0;
}

GameObjectEditForm.prototype = {

    show: function () {
        var val, i, goType = this.gameObject.gameObjectType();
        $("#object-form").html('');
        $("#object-form").off();
 
        $("#object-form").append('<span id="object-type">' + goType + '</span><br>');
        $("#object-form").append('<span id="location-display">x: ' + this.gameObject.x + ' y: ' + this.gameObject.y + '</span><br>');

        if (goType === "Influencer" || goType === "Sink" || goType === "Star") {
            $("#object-form").append('radius: <input id="radius-input" type="text" value="' + this.gameObject.radius + '"></span><br>');
            $("#radius-input").change($.proxy(function () {
                val = $("#radius-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setRadius(val);
                    //this.gameObject.radius = val;
                    //this.gameObject.w = val;
                    //this.gameObject.h = val;
                    this.gameObject.updatePoints();
                }
            }, this));
            $("#object-form").append('influence radius: <input id="influence-radius-input" type="text" value="' + this.gameObject.influenceRadius + '"></span><br>');
            $("#influence-radius-input").change($.proxy(function () {
                val = $("#influence-radius-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.influenceRadius = val;
                }
            }, this));

            $("#object-form").append('force: <input id="force-input" type="text" value="' + this.gameObject.force + '"></span><br>');
            $("#force-input").change($.proxy(function () {
                val = $("#force-input").val();
                if (isNumber(val)) {
                    this.gameObject.force = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        } else if (goType === "GridWall") {

            $("#object-form").append('Has Door: <input id="has-door-input" type="checkbox"' + (this.gameObject.hasDoor ? "checked" : "") + '></span><br>');
            $("#has-door-input").change($.proxy(function () {
                val = $("#has-door-input").prop('checked');
                this.gameObject.hasDoor = val;
            }, this));

            $("#object-form").append('Door s1: <input id="door-s1-input" type="text" value="' + this.gameObject.getS1() + '"></span><br>');
            $("#door-s1-input").change($.proxy(function () {
                val = $("#door-s1-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setS1(val);
                }
            }, this));

            $("#object-form").append('Door s2: <input id="door-s2-input" type="text" value="' + this.gameObject.getS2() + '"></span><br>');
            $("#door-s2-input").change($.proxy(function () {
                val = $("#door-s2-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setS2(val);
                }
            }, this));

        } else {
            $("#object-form").append('w: <input id="w-input" type="text" value="' + this.gameObject.w + '"><br>');
            $("#w-input").change($.proxy(function (e) {
                val = $("#w-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.w = val;
                    this.gameObject.updatePoints();
                }
            }, this));

            $("#object-form").append('h: <input id="h-input" type="text" value="' + this.gameObject.h + '"></span><br>');
            $("#h-input").change($.proxy(function () {
                val = $("#h-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.h = val;
                    this.gameObject.updatePoints();
                }
            }, this));

            $("#object-form").append('theta: <input id="theta-input" type="text" value="' + this.gameObject.theta + '"></span><br>');
            $("#theta-input").change($.proxy(function () {
                val = $("#theta-input").val();
                if (isNumber(val)) {
                    this.gameObject.theta = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (goType === "Sink") {
            $("#object-form").append('Nozzle Speed: <input id="nozzle-speed-input" type="text" value="' + this.gameObject.speed + '"></span><br>');
            $("#nozzle-speed-input").change($.proxy(function () {
                val = $("#nozzle-speed-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.speed = val;
                }
            }, this));

            $("#object-form").append('Is Source: <input id="is-source-input" type="checkbox"' + (this.gameObject.isSource ? "checked" : "") + '></span><br>');
            $("#is-source-input").change($.proxy(function () {
                val = $("#is-source-input").prop('checked');
                this.gameObject.isSource = val;
                this.gameObject.lockedIn = val;
            }, this));
            $("#object-form").append('Influence Bound: <input id="influence-bound-input" type="checkbox"' + (this.gameObject.influenceBound ? "checked" : "") + '></span><br>');
            $("#influence-bound-input").change($.proxy(function () {
                val = $("#influence-bound-input").prop('checked');
                this.gameObject.influenceBound = val;
            }, this));
        }

        if (goType === "Source") {
            $("#object-form").append('particle speed: <input id="speed-input" type="text" value="' + this.gameObject.v + '"></span><br>');
            $("#speed-input").change($.proxy(function () {
                val = $("#speed-input").val();
                if (isNumber(val)) {
                    this.gameObject.v = parseFloat(val);
                    this.gameObject.updatePoints();
                }
            }, this));

        }

        if (goType === "Star") {
            $("#object-form").append('Star Type: <select id="star-type-select"></select><br>');
            for (i = 0; i < StarTypes.length; i += 1) {
                $("#star-type-select").append('<option value=' + StarTypes[i] + '>' + StarTypes[i] + '</option>');
            }
            $("#star-type-select").val(this.gameObject.starType);
            $("#star-type-select").change($.proxy(function () {
                val = $("#star-type-select option:selected").text();
                this.gameObject.starType = val;
            }, this));
        }

        $("#object-form").append('Interactable: <input id="interactable-input" type="checkbox" value="' + this.gameObject.interactable + '"></span><br>');
        $("#interactable-input").change($.proxy(function () {
            val = $("#interactable-input").prop('checked');
            this.gameObject.interactable = val;
        }, this));

        $("#object-form").append('<br><input id="delete-button" type="button" value="Delete">');
        $("#delete-button").button().click($.proxy(function () {
            this.deleteObject();
        }, this));

    },

    hide: function () {
        var val;
        $("#object-form").html('');
        $("#object-form").off();
        //edit our grid
        $("#object-form").append('<span id="object-type">Gameboard Grid</span><br>');
        $("#object-form").append('Number of Grid Columns: <input id="grid-cols-input" type="text" value="' + this.waterfall.grid.nCols() + '"></span><br>');
        $("#grid-cols-input").change($.proxy(function () {
            val = $("#grid-cols-input").val();
            if (isPositiveNumber(val)) {
                //this.gameObject.setRadius(val);
                //this.gameObject.radius = val;
                //this.gameObject.w = val;
                //this.gameObject.h = val;
                //this.gameObject.updatePoints();
                console.log("update n grid cols");
            }
        }, this));
    },

    updateLocation: function () {
        //the object has moved so update the x and y coordinates
        $("#location-display").html('x: ' + this.gameObject.x + ' y: ' + this.gameObject.y);
    },

    deleteObject: function () {
        //console.log(this.waterfall.interactable);
        var o = this.gameObject,
            goType = o.gameObjectType(),
            index;
        if (goType === "Bucket") {
            index = this.waterfall.buckets.indexOf(o);
            this.waterfall.buckets.splice(index, 1);
        }
        if (goType === "Influencer") {
            index = this.waterfall.influencers.indexOf(o);
            this.waterfall.influencers.splice(index, 1);
        }
        if (goType === "Obstacle") {
            index = this.waterfall.obstacles.indexOf(o);
            this.waterfall.obstacles.splice(index, 1);
        }
        if (goType === "Portal") {
            index = this.waterfall.portals.indexOf(o);
            this.waterfall.portals.splice(index, 1);
        }
        if (goType === "Source") {
            index = this.waterfall.sources.indexOf(o);
            this.waterfall.sources.splice(index, 1);
        }
        if (goType === "Sink") {
            index = this.waterfall.sinks.indexOf(o);
            this.waterfall.sinks.splice(index, 1);
        }
        if (goType === "Star") {
            index = this.waterfall.stars.indexOf(o);
            this.waterfall.stars.splice(index, 1);
        }
    }
};
