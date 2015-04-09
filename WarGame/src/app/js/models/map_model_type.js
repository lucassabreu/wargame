(function (App) {
    
    var MapTypeModel = function (id, jsonConfig) {
        this.id = id;
    };
    
    MapTypeModel.prototype = {
        id : null,
        continents : [],
        territories : [],
        map : null,
        goalCards : [],
        
        /**
     * Create a Map entity based on the model
     **/
    buildMap : function () {
        }
    };
    
    MapTypeModel.models = [];
    
    MapTypeModel.register = function (id, jsonConfig) {
        return this.models[id] = new MapTypeModel(id, jsonConfig);
    };
    
    MapTypeModel.get = function (id) {
        return this.model[id];
    };

    App.Models.MapTypeModel = MapTypeModel;

}) (window.App);