(function (App) {
    'use strict';
    
    var GameServiceLocal = function (App) {
        this.app = App;
        this.history = [];
    };

    GameServiceLocal.prototype = {
        app : null,
        map : null,
        game : null,
        history : []
    };

    GameServiceLocal.prototype.__defineGetter__('playerAI', function(){
        return this.app.ServiceFactory.getService('player_ai_service');
    });

    GameServiceLocal.prototype.__defineGetter__('mapService', function () {
        return this.app.ServiceFactory.getService('map_service');
    });
    
    GameServiceLocal.prototype.getNewArmiesForPlayer = function(player){
        var number = Math.floor( player.territories.length / 2.0 );
        var armies = [];

        for(var i = 0; i < number; i++)
            armies.push(this._createArmy(player));

        return armies;
    };

    GameServiceLocal.prototype.placeArmyAt = function(player, army, territory){
        territory.armies.push(army);
    };

    GameServiceLocal.prototype.endPlaceTurn = function(player, callbackFunction){
        // todo: make ai now !!!!

        for(var key in this.game.otherPlayers)
            this.playerAI.executePlacementTurnOf(this.game.otherPlayers[key]);

        callbackFunction(this.game);
    };

    GameServiceLocal.prototype.startGame = function (mapId, callbackFunction) {
        this.map = this.mapService.getMap(mapId);

        this.game = new App.Models.Game(uuid.v1(), this.map.id);
        var game = this.game;

        // randomize colors
        
        var colors = Array.copy(App.ArmyColors);
        var goals = Array.copy(this.map.goalCards);

        this.game.player = this._createPlayer("Real Person", colors, goals);
        this.game.otherPlayers.push(this._createPlayer("AI 1", colors, goals));
        this.game.otherPlayers.push(this._createPlayer("AI 2", colors, goals));

        // randomize the start territories

        var territories = Array.shuffle(Array.copy(this.map.territories));
        var players = this.game.players;

        var territory;
        while(territory = territories.pop())
            this._createArmy(players[territories.length % players.length], territory);

        // register and return
        this.history.push(this.game);
        callbackFunction(this.game);
    };
    
    GameServiceLocal.prototype.getSVG = function () {
        return this.mapService.getSVG(this.map.id);
    };

    GameServiceLocal.prototype.getCurrentGame = function () {
        return this.game;
    };
    
    GameServiceLocal.prototype.getCurrentMap = function () {
        return this.map;
    };
    
    // internal

    GameServiceLocal.prototype._getRandom = function (max) {
        return Math.floor((Math.random() * max));
    };

    // create helpers

    GameServiceLocal.prototype._createArmy = function(player, territory){
        var army = new App.Models.Army(uuid.v1(), player);
        army.territory = territory;

        if (territory)
            territory.armies.push(army);
        
        this.game.addArmy(army);
        return army;
    };

    GameServiceLocal.prototype._createPlayer = function(name, colors, goals){
        var player = new App.Models.Player(name);
        var color = this._getRandom(colors.length);
        var goal = this._getRandom(goals.length);
        player.armyColor = Array.remove(color, colors);
        player.goalCard = Array.remove(goal, goals);

        return player;
    };

    App.ServiceFactory.register('game_service', new GameServiceLocal(App));

})(window.App);