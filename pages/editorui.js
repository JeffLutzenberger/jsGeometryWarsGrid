'use strict';

var GameObjectEditForm = function (influencer) {
    this.influencer = influencer;
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

        $("#object-form").append('radius: <input id="radius-input" type="text" value="' + this.gameObject.radius + '"></span><br>');
        $("#radius-input").change($.proxy(function () {
            val = $("#radius-input").val();
            if (isPositiveNumber(val)) {
                this.gameObject.setRadius(val);
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
    },

    hide: function () {
        var val;
        $("#object-form").html('');
        $("#object-form").off();
        //edit our grid
        //$("#object-form").append('<span id="object-type">Gameboard Grid</span><br>');
        //$("#object-form").append('Number of Grid Columns: <input id="grid-cols-input" type="text" value="' + this.waterfall.grid.nCols() + '"></span><br>');
        //$("#grid-cols-input").change($.proxy(function () {
        //    val = $("#grid-cols-input").val();
        //    if (isPositiveNumber(val)) {
        //        console.log("update n grid cols");
        //    }
        //}, this));
    },

    updateLocation: function () {
        //the object has moved so update the x and y coordinates
        $("#location-display").html('x: ' + this.gameObject.x + ' y: ' + this.gameObject.y);
    }
};
