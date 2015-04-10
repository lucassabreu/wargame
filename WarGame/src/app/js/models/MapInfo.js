(function (App) {
    
    // Army entity
    var MapInfo = function (id, name, description) {
        
        this.id = id;
        this.name = name;
        this.description = description;

    };
    
    MapInfo.prototype = {
        id : null,
        name : null,
        description : null,
    };

    App.Models.MapInfo = MapInfo;
})(App);