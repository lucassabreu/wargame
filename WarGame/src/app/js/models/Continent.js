(function (App) {
    
    var Continent = function (name, territories, bonusArmy) {
        this.name = name;
        this.territories = territories;
        this.bonusArmy = bonusArmy;
        this.occupiedBy = null;
        
        for (var key in this.territories) {
            this.__territoriesMap[this.territories[key].name] = this.territories[key];
            this.territories[key].continent = this;
        }
    };
    
    Continent.prototype = {
        name : null,
        territories : [],
        occupiedBy : null,
        bonusArmy: 0,

        __territoriesMap : {},
    };
    
    Continent.prototype.getTerritory = function (territoryName) {
        return this.__territoriesMap[territoryName];
    };
    
    App.Models.Continent = Continent;
})(window.App);