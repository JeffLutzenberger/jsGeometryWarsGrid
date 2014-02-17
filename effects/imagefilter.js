'use strict';
//http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

var Filters = function (canvas) {
    this.tmpCanvas = document.createElement('tmpCanvas');
    this.tmpCtx = Filters.tmpCanvas.getContext('2d');
};

Filters.prototype = {

    getPixels: function (img) {
        var c = this.getCanvas(img.width, img.height),
            ctx = c.getContext('2d');
        ctx.drawImage(img);
        return ctx.getImageData(0, 0, c.width, c.height);
    },
    
    createImageData: function (w, h) {
        return this.tmpCtx.createImageData(w, h);
    },

    filterImage: function (filter, image, var_args) {
        var i, args = [this.getPixels(image)];
        for (i = 2; i < arguments.length; i += 1) {
            args.push(arguments[i]);
        }
        return filter.apply(null, args);
    },

    brightness: function (pixels, adjustment) {
        var i, d = pixels.data;
        for (i = 0; i < d.length; i += 4) {
            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }
        return pixels;
    },

    grayscale: function (pixels, args) {
        var i, r, g, b, v, d = pixels.data;
        for (i = 0; i < d.length; i += 4) {
            r = d[i];
            g = d[i + 1];
            b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        return pixels;
    },

    convolute: function (pixels, weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length)),
            halfSide = Math.floor(side / 2),
            src = pixels.data,
            sw = pixels.width,
            sh = pixels.height,
            // pad output by the convolution matrix
            w = sw,
            h = sh,
            output = Filters.createImageData(w, h),
            dst = output.data,
            // go through the destination image pixels
            alphaFac = (opaque ? 1 : 0),
            y, x, sy, sx, dstOff, r, g, b, a, cy, cx,
            scy, scx, srcOff, wt;
        
        for (y = 0; y < h; y += 1) {
            for (x = 0; x < w; x += 1) {
                sy = y;
                sx = x;
                dstOff = (y * w + x) * 4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                r = g = b = a = 0;
                for (cy = 0; cy < side; cy += 1) {
                    for (cx = 0; cx < side; cx += 1) {
                        scy = sy + cy - halfSide;
                        scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            srcOff = (scy * sw + scx) * 4;
                            wt = weights[cy * side + cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return output;
    }
};
