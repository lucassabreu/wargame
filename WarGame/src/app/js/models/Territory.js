(function (App) {
    var Territory = function (name, neighbors, query, center) {
        this.name = name;
        this.query = query;
        this.center = center;
        this.neighbors = neighbors;

        this.armies = [];
    }
    
    Territory.prototype = {
        continent : null,
        name : '',
        query : '',
        center : null,
        neighbors : [],
        armies : [],
    }

    Territory.prototype.__defineGetter__('occupiedBy', function(){
        if (this.armies.length == 0)
            return null;
        else
            return this.armies[0].player;
    });

    Territory.prototype.__defineGetter__('armyColor', function(){
        return this.occupiedBy.armyColor;
    });

    App.Models.Territory = Territory;
})(window.App);