(function (App) {
    
    'use strict';

    var fs = require('fs');
    var MapServiceLocal = function (App) {
        this.app = App;
    };

    MapServiceLocal.prototype = {
        app : null,

        _mapsInfo : [],

        getMapsInfo : function () {

            if (this._mapsInfo.length == 0) {
                
                var files = fs.readdirSync("./data");
                var map = null;

                for (var key in files) {
                    map = require('./data/' + files[key] + '/info.json');
                    this._mapsInfo.push(
                        new App.Models.MapInfo(files[key], map.name, map.description)
                    );
                }
            }
            
            // make a copy of the array
            return this._mapsInfo.filter(function () { return true; });
        },
    };

    App.ServiceFactory.register('map_service', new MapServiceLocal(App));

})(window.App);