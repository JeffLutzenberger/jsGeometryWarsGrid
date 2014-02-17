'use strict';

var Canvas = function (canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = this.ctx.strokeStyle = 'black';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.degtorad = Math.PI / 180;
    this.m = 1;
};

Canvas.prototype = {

    clear: function (bgColor) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (bgColor) {
            //this.ctx.fillStyle = bgColor;
            //this.ctx.rect(0, 0, this.width, this.height);
            //this.ctx.fill();
        }
    },
   
    push: function () {
        this.ctx.save();
    },

    pop: function () {
        this.ctx.restore();
    },

    rgba: function (c, alpha) {
        var a = alpha;
        if (alpha === undefined) {
            a = 1.0;
        }
        return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
    },

    brighten: function (color, n) {
        var r = color[0] + Math.round(n * 255),
            g = color[1] + Math.round(n * 255),
            b = color[2] + Math.round(n * 255);
        return [Math.min(r, 255), Math.min(g, 255), Math.min(b, 255)];
    },

    rotatePoint : function (x, y, theta) {
        var x1 = Math.cos(theta) * x + Math.sin(theta) * y,
            y1 = -Math.sin(theta) * x + Math.cos(theta) * y;
        return new Vector(x1, y1);
    },

    circle: function (x, y, r, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.fill();
    },

    circleOutline: function (x, y, r, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.stroke();
    },

    radialGradient: function (x, y, rin, rout, cin, cout, ain, aout) {
        var gradient = this.ctx.createRadialGradient(x, y, rin, x, y, rout);
        gradient.addColorStop(0, this.rgba(cin, ain));
        gradient.addColorStop(1, this.rgba(cout, aout));
        this.ctx.arc(x, y, rout, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    },

    ellipse: function (xc, yc, w, h, lineWidth, color, alpha) {
        var kappa = 0.5522848,
            x = xc - 0.5 * w,
            y = yc - 0.5 * h,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(x, ym);
        this.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        //this.ctx.closePath();
        this.ctx.stroke();
    },

    line: function (p1, p2, w, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.stroke();
    },
    
    linexy: function (x1, y1, x2, y2, w, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },

    rectangle: function (p1, p2, p3, p4, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    rectangleOutline: function (p1, p2, p3, p4, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    },

    triangle: function (p1, p2, p3, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    triangleOutline: function (p1, p2, p3, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    arrowHead: function (center, size, theta, color, alpha) {
        var p1 = this.rotatePoint(0, size * 0.5, theta),
            p2 = this.rotatePoint(-size * 0.4, -size * 0.5, theta),
            p3 = this.rotatePoint(size * 0.4, -size * 0.5, theta);
        p1.x += center.x;
        p1.y += center.y;
        p2.x += center.x;
        p2.y += center.y;
        p3.x += center.x;
        p3.y += center.y;
        this.triangle(p1, p2, p3, color, alpha);
    },

    diamond: function (x, y, w, h, theta, lineWidth, color, alpha) {
        var p1 = this.rotatePoint(w * 0.5, 0, theta),
            p2 = this.rotatePoint(0, h * 0.5, theta),
            p3 = this.rotatePoint(-w * 0.5, 0, theta),
            p4 = this.rotatePoint(0, -h * 0.5, theta);
        p1.x += x;
        p1.y += y;
        p2.x += x;
        p2.y += y;
        p3.x += x;
        p3.y += y;
        p4.x += x;
        p4.y += y;
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.lineTo(p4.x, p4.y);
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.stroke();
    },

    astrix: function (x, y, w, h, theta, lineWidth, color, alpha) {
        var p1 = new Vector(-w * 0.5, 0),
            p2 = new Vector(w * 0.5, 0),
            p3 = new Vector(p1.x + x, p1.y + y),
            p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);
        p1 = this.rotatePoint(p1.x, p1.y, 22.5);
        p2 = this.rotatePoint(p2.x, p2.y, 22.5);
        p3 = new Vector(p1.x + x, p1.y + y),
        p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);
        p1 = this.rotatePoint(p1.x, p1.y, 22.5);
        p2 = this.rotatePoint(p2.x, p2.y, 22.5);
        p3 = new Vector(p1.x + x, p1.y + y),
        p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);
        p1 = this.rotatePoint(p1.x, p1.y, 22.5);
        p2 = this.rotatePoint(p2.x, p2.y, 22.5);
        p3 = new Vector(p1.x + x, p1.y + y),
        p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);
        p1 = this.rotatePoint(p1.x, p1.y, 22.5);
        p2 = this.rotatePoint(p2.x, p2.y, 22.5);
        p3 = new Vector(p1.x + x, p1.y + y),
        p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);
        p1 = this.rotatePoint(p1.x, p1.y, 22.5);
        p2 = this.rotatePoint(p2.x, p2.y, 22.5);
        p3 = new Vector(p1.x + x, p1.y + y),
        p4 = new Vector(p2.x + x, p2.y + y);
        this.line(p3, p4, lineWidth, color, alpha);

    },

    windmill: function (x, y, w, h, theta, lineWidth, color, alpha) {
        var p1 = this.rotatePoint(w * 0.5, h * 0.5, theta),
            p2 = this.rotatePoint(0, h * 0.5, theta),
            p3 = this.rotatePoint(0, -h * 0.5, theta),
            p4 = this.rotatePoint(-w * 0.5, -h * 0.5, theta);
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(p1.x + x, p1.y + y);
        this.ctx.lineTo(p2.x + x, p2.y + y);
        this.ctx.lineTo(p3.x + x, p3.y + y);
        this.ctx.lineTo(p4.x + x, p4.y + y);
        this.ctx.lineTo(p1.x + x, p1.y + y);
        this.ctx.stroke();
        p1 = this.rotatePoint(w * 0.5, 0, theta);
        p2 = this.rotatePoint(w * 0.5, -h * 0.5, theta);
        p3 = this.rotatePoint(-w * 0.5, h * 0.5, theta);
        p4 = this.rotatePoint(-w * 0.5, -h * 0, theta);
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(p1.x + x, p1.y + y);
        this.ctx.lineTo(p2.x + x, p2.y + y);
        this.ctx.lineTo(p3.x + x, p3.y + y);
        this.ctx.lineTo(p4.x + x, p4.y + y);
        this.ctx.lineTo(p1.x + x, p1.y + y);
        this.ctx.stroke();
    },

    gear: function (x, y, rin, rout, theta, lineWidth, color, alpha) {
        var i, x1, y1, thetaGear = theta, ngears = 10,
            dtheta = Math.PI * 2 / ngears, 
            outerPoints = [],
            innerPoints = [];
        for (i = 0; i < ngears; i += 1) {
            x1 = rin * Math.cos(thetaGear);
            y1 = rin * Math.sin(thetaGear);
            innerPoints[i] = new Vector(x1, y1);
            x1 = rout * Math.cos(thetaGear);
            y1 = rout * Math.sin(thetaGear);
            outerPoints[i] = new Vector(x1, y1);
            thetaGear += dtheta;
        }
        
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        thetaGear = theta;
        for (i = 0; i < innerPoints.length; i += 1) {
            if (i % 2) {
                this.ctx.moveTo(x + innerPoints[i].x, y + innerPoints[i].y);
                this.ctx.arc(x, y, rin, thetaGear, thetaGear + dtheta, false);
                this.ctx.moveTo(x + innerPoints[i].x, y + innerPoints[i].y);
                this.ctx.lineTo(x + outerPoints[i].x, y + outerPoints[i].y);
            }
            else {
                this.ctx.moveTo(x + outerPoints[i].x, y + outerPoints[i].y);
                this.ctx.arc(x, y, rout, thetaGear, thetaGear + dtheta, false);
                this.ctx.moveTo(x + outerPoints[i].x, y + outerPoints[i].y);
                this.ctx.lineTo(x + innerPoints[i].x, y + innerPoints[i].y);
            }
            thetaGear += dtheta;
        }
        this.ctx.moveTo(x + rin * 0.6, y);
        this.ctx.arc(x, y, rin * 0.6, 0, Math.PI * 2, false);
        this.ctx.stroke();
    },

    saw: function (x, y, rin, rout, theta, lineWidth, color, alpha) {
        var i, x1, y1, thetaGear = theta, ngears = 8,
            dtheta = Math.PI * 2 / ngears, 
            outerPoints = [],
            innerPoints = [],
            sawPoints = [];
        for (i = 0; i < ngears; i += 1) {
            x1 = rin * Math.cos(thetaGear);
            y1 = rin * Math.sin(thetaGear);
            sawPoints.push(new Vector(x1, y1));
            x1 = rout * Math.cos(thetaGear);
            y1 = rout * Math.sin(thetaGear);
            sawPoints.push(new Vector(x1, y1));
            thetaGear += dtheta;
        }
        
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        thetaGear = theta;
        this.ctx.moveTo(x + sawPoints[0].x, y + sawPoints[0].y); 
        for (i = 1; i < sawPoints.length; i += 1) {
            this.ctx.lineTo(x + sawPoints[i].x, y + sawPoints[i].y);
        }
        this.ctx.lineTo(x + sawPoints[0].x, y + sawPoints[0].y);
        this.ctx.moveTo(x + rin * 0.5, y);
        this.ctx.arc(x, y, rin * 0.5, 0, Math.PI * 2, false);
        this.ctx.stroke();
    },
    
    fourcircles: function (x, y, r, theta, lineWidth, color, alpha) {
        //this.ctx.strokeStyle = this.rgba(color, alpha);
        //this.ctx.lineWidth = lineWidth;
        this.circleOutline(x - r * 0.35, y, r * 0.25, lineWidth, color, alpha);
        this.circleOutline(x + r * 0.35, y, r * 0.25, lineWidth, color, alpha);
        this.circleOutline(x, y - r * 0.35, r * 0.25, lineWidth, color, alpha);
        this.circleOutline(x, y + r * 0.35, r * 0.25, lineWidth, color, alpha);
        this.circleOutline(x, y, r * 0.75, lineWidth, color, alpha);
        //this.ellipse(x, y, r * 2, r * 0.75, lineWidth, color, alpha);
    },
 
    target: function (x, y, r, theta, lineWidth, color, alpha) {
        var i, x1, y1, theta1 = Math.PI / 6, theta2 = Math.PI / 3;
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        for (i = 0; i < 4; i += 1) {
            x1 = x + r * 0.4 * Math.cos(theta);
            y1 = y + r * 0.4 * Math.sin(theta);
            this.ctx.moveTo(x1, y1);
            this.ctx.arc(x, y, r * 0.4, theta, theta + theta2, false);
            this.ctx.moveTo(x1, y1);
            x1 = x + r * 0.6 * Math.cos(theta);
            y1 = y + r * 0.6 * Math.sin(theta);
            this.ctx.lineTo(x1, y1);
            x1 = x + r * 0.4 * Math.cos(theta + theta2);
            y1 = y + r * 0.4 * Math.sin(theta + theta2);
            this.ctx.moveTo(x1, y1);
            x1 = x + r * 0.6 * Math.cos(theta + theta2);
            y1 = y + r * 0.6 * Math.sin(theta + theta2);
            this.ctx.lineTo(x1, y1);
            this.ctx.arc(x, y, r * 0.6, theta + theta2, theta, true);

            x1 = x + r * 0.8 * Math.cos(theta);
            y1 = y + r * 0.8 * Math.sin(theta);
            this.ctx.moveTo(x1, y1);
            this.ctx.arc(x, y, r * 0.8, theta, theta + theta2, false);
            this.ctx.moveTo(x1, y1);
            x1 = x + r * 1.0 * Math.cos(theta);
            y1 = y + r * 1.0 * Math.sin(theta);
            this.ctx.lineTo(x1, y1);
            x1 = x + r * 0.8 * Math.cos(theta + theta2);
            y1 = y + r * 0.8 * Math.sin(theta + theta2);
            this.ctx.moveTo(x1, y1);
            x1 = x + r * 1.0 * Math.cos(theta + theta2);
            y1 = y + r * 1.0 * Math.sin(theta + theta2);
            this.ctx.lineTo(x1, y1);
            this.ctx.arc(x, y, r * 1.0, theta + theta2, theta, true);
            theta += theta1 + theta2;
        }
        this.ctx.stroke();
    },


    jellyfish: function (x, y, r, theta, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, Math.PI, 0, false);
        this.ctx.stroke();
        this.circleOutline(x, y - r * 0.25, r * 0.1, lineWidth, color, alpha);
        this.ellipse(x, y, r * 2, r * 0.75, lineWidth, color, alpha);
    },


    electricityLine: function (p1, p2, lineWidth, shockiness, color, alpha) {
        var i, npoints = shockiness * 3, points = [], v = new Vector(p2.x - p1.x, p2.y - p1.y),
            n = VectorMath.normalize(new Vector(-v.y, v.x)), l = VectorMath.length(v), dl;
        //console.log("l  = " + l);
        points[0] = [p1.x, p1.y];
        points[npoints - 1] = [p2.x, p2.y];
        for (i = 1; i < npoints - 1; i += 1) {
            //console.log(p1.x + i / npoints * v.x);
            //console.log(p1.y + i / npoints * v.y);
            points[i] = [p1.x + i / npoints * v.x, p1.y + i / npoints * v.y];
            dl = Math.random() * shockiness;
            points[i][0] += n.x * dl;
            points[i][1] += n.y * dl;
            //console.log(points[i]);
            this.linexy(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], lineWidth, color, alpha);
        }
        this.linexy(points[npoints - 2][0], points[npoints - 2][1], points[npoints - 1][0], points[npoints - 1][1], lineWidth, color, alpha);
    },

    text: function (x, y, color, fontFamily, fontSize, str) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px " + fontFamily;
        this.ctx.fillText(str, x * this.m, y * this.m);
    },

    grid: function (dx, dy, w, h, lineWeight, color, alpha) {
        var i, nx = w / dx, ny = h / dy;
        alpha = alpha || 1;
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWeight;
        for (i = 0; i < nx + 1; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(dx * i * this.m, 0);
            this.ctx.lineTo(dx * i * this.m, h * this.m);
            this.ctx.stroke();
        }
        for (i = 0; i < ny + 1; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, dy * i * this.m);
            this.ctx.lineTo(w * this.m, dy * i * this.m);
            this.ctx.stroke();
        }

    },

    drawImage: function (image, x, y, w, h, theta) {
        //this.ctx.drawImage(image, x, y, w, h);
        this.push();
        this.ctx.translate(x, y);
        this.ctx.rotate(theta * this.degtorad);
        this.ctx.drawImage(image, -w * 0.5, -h * 0.5, w, h);
        this.pop();
    }
};

var Camera = function (canvas) {
    this.canvas = canvas;
    this.viewport = new Vector(canvas.width, canvas.height);
    this.center = new Vector(0, 0);
    this.scaleConstant = 1;
    this.zoomFactor = 1;
    this.transition = false;
    this.startTransitionCenter = new Vector(this.center.x, this.center.y);
    this.endTransitionCenter = new Vector(this.center.x, this.center.y);
    this.startViewportSize = new Vector(this.viewport.x, this.viewport.y);
    this.endViewportSize = new Vector(this.viewport.x, this.viewport.y);
    this.zoomTime = 0;
};

Camera.prototype = {

    push: function () {
        this.canvas.ctx.save();
    },

    pop: function () {
        this.canvas.ctx.restore();
    },

    setExtents: function (w, h) {
        this.viewportWidth = w;
        this.viewportHeight = h;
        this.zoomFactor = this.canvas.width / w;
    },

    setZoom: function (x) {
        this.zoomFactor = x;
        this.viewportWidth = this.zoomFactor / this.canvas.width;
        this.viewportHeight = this.zoomFactor / this.canvas.height;
    },

    setCenter: function (x, y) {
        this.center.x = x;
        this.center.y = y;
    },

    show: function () {
        this.canvas.ctx.scale(this.zoomFactor, this.zoomFactor);
        this.canvas.ctx.translate(-this.center.x, -this.center.y);
    },

    reset: function (bgColor) {
        this.pop();
        this.canvas.clear(bgColor);
        this.push();
        //move the viewport center to 0,0
        this.canvas.ctx.translate(this.canvas.width * 0.5,
                                  this.canvas.height * 0.5);
    },

    startTransition: function (toCenter, toViewportSize, transitionTime) {
        this.zoomTransition = true;
        this.startTransitionCenter = new Vector(this.center.x, this.center.y);
        this.endTransitionCenter = new Vector(toCenter.x, toCenter.y);
        this.startViewportSize = new Vector(this.viewportWidth, this.viewportHeight);
        this.endViewportSize = new Vector(toViewportSize.x, toViewportSize.y);
        this.zoomTime = 0;
    },

    onZoomTransition: function (dt) {
        var duration = 500,
            centerDeltaX = this.finalZoomCenter.x - this.startZoomCenter.x,
            centerDeltaY = this.finalZoomCenter.y - this.startZoomCenter.y,
            extentDeltaX = this.finalZoomExtents.x - this.startZoomExtents.x,
            extentDeltaY = this.finalZoomExtents.y - this.startZoomExtents.y,
            x,
            y;
        //when this.zoomTime = duration we should be fully transitioned
        if (this.zoomTime > duration) {
            this.zoomTime = duration;
            this.zoomTransition = false;
        }
        x = this.zoomTime / duration * centerDeltaX + this.startZoomCenter.x;
        y = this.zoomTime / duration * centerDeltaY + this.startZoomCenter.y;
        this.camera.setCenter(x, y);
        x = this.zoomTime / duration * extentDeltaX + this.startZoomExtents.x;
        y = this.zoomTime / duration * extentDeltaY + this.startZoomExtents.y;
        this.camera.setExtents(x, y);
        this.zoomTime += dt;
    },

    screenToWorld: function (x, y) {
        //screen for canvas is 0, 0 with y down
        //our world coords are also y down
        var upperleftx = this.center.x - this.viewportWidth * 0.5,
            upperlefty = this.center.y - this.viewportHeight * 0.5,
            x1 = x / this.canvas.width * this.viewportWidth + upperleftx,
            y1 = y / this.canvas.height * this.viewportHeight + upperlefty;
        return new Vector(x1, y1);
    }
};

