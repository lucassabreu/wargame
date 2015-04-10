function Territory(name, neighbors, isOccupiedBy){
    this.name = name;
    this.neighbors = neighbors;
    this.isOccupiedBy = null;
}

Territory.prototype = {
    name : null,
    neighbors : [],
    isOccupiedBy : null,

    getNeighbors : function (){
        return null;
    },
    getIsOccupied : function (){
        return null;
    },
}