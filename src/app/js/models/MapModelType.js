(function (App) {
    
    /**
     * Keep the build instructions for a Map (all in JSON objects)
     */ 
     var MapModelType = function (id, name, description, continents, goalCards, mapImage) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.continents = continents;
        this.goalCards = goalCards;
        this.image = mapImage;
    };
    
    MapModelType.prototype = {
        id : null,
        name : '',
        description : '',
        continents : [],
        image : null,
        goalCards : [],
    };
    
    App.Models.MapModelType = MapModelType;

}) (window.App);