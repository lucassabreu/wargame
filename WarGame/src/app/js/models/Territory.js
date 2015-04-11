(function (App) {
    var Territory = function (name, neighbors, query) {
        this.name = name;
        this.query = query;
        this.neighbors = neighbors;
        this.occupiedBy = null;
    }
    
    Territory.prototype = {
        name : '',
        query : '',
        neighbors : [],
        occupiedBy : null,
        
        getNeighbors : function () {
            return null;
        },
        getIsOccupied : function () {
            return null;
        },
    }

    App.Models.Territoty = Territory;
})(window.App);