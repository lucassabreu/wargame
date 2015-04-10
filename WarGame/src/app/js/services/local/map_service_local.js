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
                
                var that = this;
                var files = fs.readdirSync("./data");

                for (var key in files) {
                    this._mapsInfo.push(require('./data/' + files[key] + '/info.json'));
                }
            }
            
            // make a copy of the array
            return this._mapsInfo.filter(function () { return true; });
        },
    };

    App.ServiceFactory.register('map_service', new MapServiceLocal(App));

})(window.App);