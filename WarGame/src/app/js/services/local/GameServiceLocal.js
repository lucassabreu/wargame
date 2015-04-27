(function (App) {
    'use strict';
    
    var GameServiceLocal = function (App) {
        this.app = App;
        this.history = [];
        this.callbacks = [];

        gs = this;
    };

    GameServiceLocal.prototype = {
        app : null,
        map : null,
        game : null,
        movedArmies : [],
        callbacks : [],
        history : [],
    };

    GameServiceLocal.prototype.__defineGetter__('playerAI', function(){
        return this.app.ServiceFactory.getService('player_ai_service');
    });

    GameServiceLocal.prototype.__defineGetter__('mapService', function () {
        return this.app.ServiceFactory.getService('map_service');
    });

    GameServiceLocal.prototype.__defineGetter__('goalService', function(){
        return this.app.ServiceFactory.getService('goal_service');
    });
    
    GameServiceLocal.prototype.getNewArmiesForPlayer = function(player){
        var number = Math.floor( player.territories.length / 2.0 );
        var armies = [];

        for(var i = 0; i < number; i++)
            armies.push(this._createArmy(player));

        return armies;
    };

    GameServiceLocal.prototype.placeArmyAt = function(player, army, territory){
        console.log(player.name + " | " + territory.name + " | " + army.id);
        territory.armies.push(army);
    };

    GameServiceLocal.prototype.attackTerritory = function(player, fromTerritory, targetTerritory, armiesNumber, callbackFunction){

        var defensePlayer = targetTerritory.occupiedBy;
        var result = {
            attackDices : [],
            defenseDices : [],
            state : null,
        };

        if (armiesNumber > 3 || armiesNumber > (fromTerritory.armies.length - 1)) {
            result.state = 'invalid';
            callbackFunction(game, result);
            return;
        }

        var defenseNumber = targetTerritory.armies.length;

        if (defenseNumber > 3)
            defenseNumber = 3;

        for(var i = 0; i < armiesNumber; i++)
            result.attackDices.push({
                number : this._getRandom(5) + 1,
                result : '',
            });

        for(var i = 0; i < defenseNumber; i++)
            result.defenseDices.push({
                number : this._getRandom(5) + 1,
                result : '',
            });

        var sortDices = function(p, c){
            return p.number > c.number ? -1 : 1;
        };

        result.defenseDices.sort(sortDices);
        result.attackDices.sort(sortDices);

        var wins = [], loses = [];

        for(var i = 0; i < result.defenseDices.length; i++) {
            if (result.attackDices[i]) {
                if (result.attackDices[i].number > result.defenseDices[i].number) {
                    result.defenseDices[i].result = 'loser';
                    result.attackDices[i].result = 'winner';
                    wins.push(targetTerritory.armies.pop());
                } else {
                    result.defenseDices[i].result = 'winner';
                    result.attackDices[i].result = 'loser';
                    loses.push(fromTerritory.armies.pop());
                }
            }
        }

        if (wins.length > loses.length)
            result.state = 'winned';
        else
            result.state = 'lost';

        if (targetTerritory.armies.length == 0) {
            result.state = 'occupied';

            var moveNumber = armiesNumber - loses.length;
            var army;

            for(var i = 0; i < moveNumber; i++) {
                army = fromTerritory.armies.pop();
                army.territory = targetTerritory;
                targetTerritory.armies.push(army);
            }
        }

        for(var i in wins)
            Array.removeItem(wins[i], defensePlayer.armies);

        for(var i in loses)
            Array.removeItem(loses[i], player.armies);

        var allDowns = [].concat(wins).concat(loses);

        for(var i in allDowns)
            this.game.removeArmy(allDowns[i]);

        callbackFunction(this.game, result);
    };

    /**
     * End the player turn of moviments
     **/
    GameServiceLocal.prototype.endMovimentTurn = function(player, callbackFunction){
        if (this._evalGoalReached(player)) {
            for(var i in this.callbacks)
                this.callbacks[i](game);
            return;
        }

        this._setCallbackOfPlayer(this.game.currentPlayer, callbackFunction);
        this.game.currentPlayer = this._nextPlayer();

        if (this.game.currentPlayer == null) {
            this.game.state = App.Models.Game.States.Placement;
            this.game.currentPlayer = this.game.players[0];
        }

        this._getCallbackOfPlayer(this.game.currentPlayer)(this.game);
    };

    /**
     * End the player turn and call for the others... 
     **/
    GameServiceLocal.prototype.endPlaceTurn = function(player, callbackFunction){

        if (this._evalGoalReached(player)) {
            for(var i in this.callbacks)
                this.callbacks[i](game);
            return;
        }

        this._setCallbackOfPlayer(this.game.currentPlayer, callbackFunction);
        this.game.currentPlayer = this._nextPlayer();

        if (this.game.currentPlayer == null) {
            this.game.state = App.Models.Game.States.Attacking;
            this.game.currentPlayer = this.game.players[0];
        }

        this._getCallbackOfPlayer(this.game.currentPlayer)(this.game);
    };

    GameServiceLocal.prototype.startGame = function (mapId, callbackFunction) {
        this.map = this.mapService.getMap(mapId);

        this.game = new App.Models.Game(uuid.v1(), this.map.id);
        var game = this.game;
        var that = this;

        // randomize colors
        
        var colors = Array.copy(App.ArmyColors);
        var goals = Array.copy(this.map.goalCards);

        this.game.state = App.Models.Game.States.Placement;

        this.game.players.push(this._createPlayer("Real Person", colors, goals));
        this.game.players.push(this._createPlayer("AI 1", colors, goals));
        this.game.players.push(this._createPlayer("AI 2", colors, goals));

        for(var i in this.game.players) {
            this._setCallbackOfPlayer(this.game.players[i], function(game){
                that.playerAI.executePlacementTurnOf(that.game.currentPlayer, game);
            });
        }

        this.game.currentPlayer = this.game.players[0];
        this.game.currentPlayer.real = true;
        this._setCallbackOfPlayer(this.game.currentPlayer, callbackFunction);

        // randomize the start territories

        var territories = Array.shuffle(Array.copy(this.map.territories));
        var players = this.game.players;

        var territory;
        while(territory = territories.pop())
            this._createArmy(players[territories.length % players.length], territory);

        for(var i in this.game.players) {
            this._evalFailedGoals(this.game.players[i]);
        }

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

    GameServiceLocal.prototype._nextPlayer = function(){
        var index = this.game.players.indexOf(this.game.currentPlayer) + 1;

        if (index < this.game.players.length)
            return this.game.players[index];
        else
            return undefined;
    };

    GameServiceLocal.prototype._setCallbackOfPlayer = function(player, callbackFunction){
        this.callbacks[this.game.players.indexOf(player)] = callbackFunction;
    };

    GameServiceLocal.prototype._getCallbackOfPlayer = function (player){
        return this.callbacks[this.game.players.indexOf(player)];
    };

    GameServiceLocal.prototype._evalFailedGoals = function(player){
        this.goalService.evalFailedGoals(player);
    };

    GameServiceLocal.prototype._evalGoalReached = function(player){
        return this.goalService.evalGoalReached(player);
    };

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

var gs;