(function (App) {

    var Game = function (id, mapId) {
        this.id = id;
        this.mapId = mapId;
        this.otherPlayers = [];
        this.armies = [];

        this._armies = {};
    };

    Game.prototype = {
        id : '',
        mapId : null,
        player : null,
        otherPlayers : [],
        armies : [],

        _armies : {},
    };

    Game.prototype.__defineGetter__('players', function(){
        var players = this.otherPlayers.slice(0);
        players.push(this.player);
        return players;
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
        this.armies = this.armies.filter(function(a) { return a != army; });
    };

    App.Models.Game = Game;

})(window.App);