function Continent(name, territories){
    this.name = name;
    this.territories = territories;
    this.isOccupiedBy = null;
}

Continent.prototype = {
    name : null,
    territories : [],
    isOccupiedBy : null,

    getTerritory : function (territoryName){
        return null;
    },
    getIsOccupiedBy : function (){
        return null;
    },
}