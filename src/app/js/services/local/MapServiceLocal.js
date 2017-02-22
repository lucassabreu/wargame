(function (App) {
    
    'use strict';
    
    var fs = require('fs');
    var MapServiceLocal = function (App) {
        this.app = App;
    };
    
    MapServiceLocal.prototype = {
        app : null,
        _mapsInfo : [],
        _loadedMapModelTypes : {},
    };
    
    MapServiceLocal.prototype.getMapBuilder = function () {
        return this.app.MapBuilder;
    };

    MapServiceLocal.prototype.getMapsInfo = function () {
        
        if (this._mapsInfo.length == 0) {
            
            var files = fs.readdirSync("./data");
            var map = null;
            
            for (var key in files) {
                map = fs.readFileSync('./data/' + files[key] + '/info.json', 'utf8').trim();
                map = JSON.parse(map);
                
                this._mapsInfo.push(
                    new App.Models.MapInfo(files[key], map.name, map.description)
                );
            }
        }
        
        // make a copy of the array
        return this._mapsInfo.filter(function () { return true; });
    };
    
    MapServiceLocal.prototype.getMapModelType = function (mapId) {
        
        if (this._loadedMapModelTypes.hasOwnProperty(mapId)) {
            return this._loadedMapModelTypes[mapId];
        } else {
            
            var mapInfo = fs.readFileSync('./data/' + mapId + '/info.json', 'utf8').trim();
            var mapData = fs.readFileSync('./data/' + mapId + '/data.json', 'utf8').trim();
            
            mapInfo = JSON.parse(mapInfo);
            mapData = JSON.parse(mapData);
            
            return new App.Models.MapModelType(
                mapId, 
                mapInfo.name, 
                mapInfo.description,
                mapData.continents,
                mapData.goalCards,
                './data/' + mapId + '/map.svg'
            );
        }

    };
    
    MapServiceLocal.prototype.getMap = function (mapId) {
        
        var mapModelType = this.getMapModelType(mapId);
        
        return this.getMapBuilder().buildMap(mapModelType);
    };
    
    MapServiceLocal.prototype.getSVG = function (mapId) {
        var svg = fs.readFileSync(this.getMapModelType(mapId).image, 'utf-8').trim();
        return svg;
    };

    App.ServiceFactory.register('map_service', new MapServiceLocal(App));

})(window.App);