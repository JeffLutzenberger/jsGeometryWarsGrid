'use strict';

var NebulaGenerator = function (w, h, bgcolor) {
    this.particles = [];
    this.color = 'rgb(4, 1, 1)';
    this.composite = 'lighter';
    this.width = w;
    this.height = h;
    this.bgcolor = bgcolor;
    this.defaultOptions = {
        maxAge : 70,
        exposure: 1.0,
        damping: 0.8,
        noise: 1.0,
        fuzz: 1.0,
        intensity: 1.0,
        initialXVelocity: 20,
        initialYVelocity: 20,
        spawn: 100
    };
    this.options = $.extend({
        preset: 'default',
        red : 1.0,
        green : 0.1,
        blue : 0.1
    }, this.defaultOptions);
    this.presets = {
        'default': this.defaultOptions,
        fine: $.extend({}, this.defaultOptions, {
            damping: 0.3,
            intensity: 0.75,
            noise: 2,
            fuzz: 2,
            initialXVelocity: 15,
            initialYVelocity: 15
        }),
        intense: $.extend({}, this.defaultOptions, {
            intensity: 3,
            maxAge: 100
        }),
        smooth: $.extend({}, this.defaultOptions, {
            intensity: 0.2,
            spawn: 100
        }),
        undamped: $.extend({}, this.defaultOptions, {
            noise: 10,
            fuzz: 0.1,
            damping: 0
        }),
        'pure noise': $.extend({}, this.defaultOptions, {
            noise: 10,
            fuzz: 0.0,
            damping: 0,
            initialXVelocity: 0,
            initialYVelocity: 0
        }),
        x: $.extend({}, this.defaultOptions, {
            initialXVelocity: 100,
            initialYVelocity: 1
        }),
        y: $.extend({}, this.defaultOptions, {
            initialYVelocity: 100,
            initialXVelocity: 1
        }),
        worms: $.extend({}, this.defaultOptions, {
            intensity: 10,
            spawn: 1,
            fuzz: 5,
            noise: 0.5,
            maxAge: 100
        })
    };
    
    this.buffercanvas = document.createElement('canvas');
    this.buffercanvas.width = w;
    this.buffercanvas.height = h;
    this.ctx = this.buffercanvas.getContext('2d');
    this.buffer = this.ctx.getImageData(0, 0, w, h);
    this.ctx.fillStyle = bgcolor;
    this.ctx.rect(0, 0, w, h);
    this.ctx.fill();
    
    this.noisecanvas = makeOctaveNoise(w, h, 8);
    this.noise = this.noisecanvas.getContext('2d').getImageData(0, 0, w, h).data;
    this.imgdata = undefined;
    this.hdrdata = undefined;
    this.FloatArray = window.Float32Array || Array;
    this.clearData();
};

NebulaGenerator.prototype = {
    createNebula: function (dt, x, y) {
        var w = this.width,
            h = this.height,
            options = this.options,
            r = options.red,
            g = options.green,
            b = options.blue,
            maxAge = options.maxAge,
            vx = options.initialXVelocity,
            vy = options.initialYVelocity,
            damping = options.damping,
            noisy = options.noise,
            fuzz = options.fuzz,
            intensity = options.intensity,
            i,
            j,
            p,
            index,
            alive = [];
        if (x && y) {
            for (i = 0; i < options.spawn; i += 1) {
                this.particles.push({
                    vx: this.fuzzy(vx),
                    vy: this.fuzzy(vy),
                    x: x,
                    y: y,
                    age: 0
                });
            }
        }

        for (i = 0; i < this.particles.length; i += 1) {
            p = this.particles[i];
            p.vx = p.vx * damping + this.getNoise(p.x, p.y, 0) * 4 * noisy + this.fuzzy(0.1) * fuzz;
            p.vy = p.vy * damping + this.getNoise(p.x, p.y, 1) * 4 * noisy + this.fuzzy(0.1) * fuzz;
            p.age += 1;

            for (j = 0; j < 10; j += 1) {
                p.x += p.vx * 0.1;
                p.y += p.vy * 0.1;
                if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) {
                    continue;
                }
                index = (~~p.x + ~~p.y * this.width) * 4;
                this.imgdata.data[index] = this.tonemap(this.hdrdata[index] += r * intensity);
                this.imgdata.data[index + 1] = this.tonemap(this.hdrdata[index + 1] += g * intensity);
                this.imgdata.data[index + 2] = this.tonemap(this.hdrdata[index + 2] += b * intensity);
            }

            if (p.age < maxAge) {
                alive.push(p);
            }
        }

        this.particles = alive;
    },
    
    getCanvas: function () {
        this.ctx.putImageData(this.imgdata, 0, 0);
        return this.buffercanvas;
    },

    tonemap: function (n) {
        return (1 - Math.pow(2, -n * 0.005 * this.options.exposure)) * 255;
    },

    clearData: function () {
        var i;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = this.bgcolor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.imgdata = this.ctx.getImageData(0, 0, this.width, this.height);
        this.hdrdata = new this.FloatArray(this.imgdata.data.length);
        for (i = 0; i < this.hdrdata.length; i += 1) {
            this.hdrdata[i] = 0;
        }
    },

    getNoise: function (x, y, channel) {
        //return fuzzy(0.4);
        // ~~ fast Math.floor
        return this.noise[(~~x + ~~y * this.width) * 4 + channel] / 127 - 1.0;
    },

    // base +/- range
    fuzzy: function (range, base) {
        return (base || 0) + (Math.random() - 0.5) * range * 2;
    }
};

function makeNoise(width, height) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        imgData = ctx.getImageData(0, 0, width, height),
        data = imgData.data,
        pixels = data.length,
        i;

    canvas.width = width;
    canvas.height = height;

    for (i = 0; i < pixels; i += 4) {
        data[i] = Math.random() * 255;
        data[i + 1] = Math.random() * 255;
        data[i + 2] = Math.random() * 255;
        data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    return canvas;
}

function makeOctaveNoise(width, height, octaves) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        i;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 1 / octaves;
    ctx.globalCompositeOperation = 'lighter';

    for (i = 0; i < octaves; i += 1) {
        var octave = makeNoise(width >> i, height >> i);
        ctx.drawImage(octave, 0, 0, width, height);
    }

    return canvas;
}
