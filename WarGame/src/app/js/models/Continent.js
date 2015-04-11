(function (App) {

    var Continent = function (name, territories) {
        this.name = name;
        this.territories = territories;
        this.occupiedBy = null;
    };
    
    Continent.prototype = {
        name : null,
        territories : [],
        occupiedBy : null,
        
        getTerritory : function (territoryName) {
            return null;
        },

        getOccupiedBy : function () {
            return null;
        },
    };

    App.Models.Continent = Continent;
})(window.App);