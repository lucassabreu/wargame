(function (App) {

    var Game = function (id, mapId) {
        this.id = id;
        this.mapId = mapId;
        this.players = [];
        this.armies = [];
        this.historic = [],
        this.state = null;

        this._armies = {};
    };

    Game.States = {
        Placement : 'Placement',
        Attacking : 'Attacking',
        Ended : 'Ended',
    };

    Game.prototype = {
        id : '',
        mapId : null,
        player : null,
        armies : [],
        winner : null,
        state : null,

        historic : [],

        _armies : {},
    };

    Game.prototype.__defineGetter__ ('completed', function(){
        return this.state == Game.States.Ended;
    });

    Game.prototype.getArmy = function(armyId){
        if (this._armies.hasOwnProperty(armyId))
            return this._armies[armyId];
        else
            return null;
    };

    Game.prototype.addArmy = function(army){
        if (!this._armies.hasOwnProperty(army.id)) {
            this.armies.push(army);
            this._armies[army.id] = army;
        }
    };

    Game.prototype.removeArmy = function(army){
        this._armies[army.id] = undefined;
        Array.removeItem(army, this.armies);
    };

    App.Models.Game = Game;

})(window.App);