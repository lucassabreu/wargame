(function (App) {
    
    // MapInfo entity
    var MapInfo = function (id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    };
    
    MapInfo.prototype = {
        id : '',
        name : '',
        description : '',
    };

    App.Models.MapInfo = MapInfo;
})(window.App);