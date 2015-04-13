(function (App) {
    var Map = function (name, continents, goalCards) {
        this.name = name;
        this.continents = continents;
        this.goalCards = goalCards;
        
        this.territories = [];
        
        for (var key in this.continents) {
            this.__continentsMap[this.continents[key].name] = this.continents[key];

            for (var key2 in this.continents[key].territories) {
                this.__territoriesMap[this.continents[key].territories[key2].name] = this.continents[key].territories[key2];
                this.territories.push(this.continents[key].territories[key2]);
            }
        }
    }
    
    Map.prototype = {
        name : null,
        territories : [],
        continents : [],
        goalCards : [],
        
        __continentsMap : {},
        __territoriesMap : {}
    };
    
    Map.prototype.getTerritory = function (territoryName) {
        return this.__territoriesMap[continentName];
    };

    Map.prototype.getContinent = function (continentName) {
        return this.__continentsMap[continentName];
    };

    Map.prototype.getGoalCard = function (goalID) {
        return this.go;
    };
    
    App.Models.Map = Map;
})(window.App);