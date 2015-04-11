(function (App) {
    var Map = function (name, continents, goals) {
        this.name = name;
        this.continents = continents;
        this.goals = goals;
        
        for (var key in this.continents) {
            for (var key2 in this.continents[key].territories) {
                this.territories.add(this.continents[key].territories[key2]);
            }
        }
    }
    
    Map.prototype = {
        
        name : null,
        territories : [],
        continents : [],
        goals : [],
        
        getTerritory : function (territoryName) {
            return null;
        },
        getContinent : function (continentName) {
            return null;
        },
        getGoals : function (goalID) {
            return null;
        },
    };

    App.Models.Map = Map;
})(window.App);