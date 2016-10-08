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
        turnCount : 0,
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

    GameServiceLocal.prototype.__defineGetter__('currentPlayer', function(){
        return this.game.currentPlayer;
    });

    GameServiceLocal.prototype.__defineSetter__('currentPlayer', function(player){
        this.game.currentPlayer = player;
    });

    GameServiceLocal.prototype.placeArmyAt = function(player, army, territory){
        if (territory.occupiedBy != player && territory.occupiedBy != null)
            throw "You can only place a army in your territories !";

        this._placeArmiesFromTo([army], territory);

        var h = {
            p : player,
            t : territory,
            a : army,
            ra : this.getNewArmiesForPlayer(player).length
        };

        h.toString = function(){
            return "Player \"" + this.p.name + "\" put a army at \"" + this.t.name + "\", " + this.ra + " armies remaining.";
        };

        this.game.historic[this.turnCount].push(h);
        console.log(h.toString());
    };

    GameServiceLocal.prototype.attackTerritory = function(player, fromTerritory, targetTerritory, armiesNumber, callbackFunction){
        var defensePlayer = targetTerritory.occupiedBy;
        var that = this;
        var result = {
            attackDices : [],
            defenseDices : [],
            state : null,
        };

        var h = {
            p : player,
            d : defensePlayer,
            from : fromTerritory,
            target : targetTerritory,
            armies : armiesNumber,
            result : result,
        };

        h.toString = function (){
            return ("Player \"" + this.p.name + "\" attacked \"" + this.target.name + 
                    "\" of \"" + this.d.name + "\" from \"" + this.from.name + "\", and " + this.result.state + 
                    " with " + this.armies.toString() + " armies.");
        };

        if (armiesNumber > 3 || armiesNumber > (fromTerritory.armies.length - 1)) {
            result.state = 'invalid';
            console.log("Called attack with invalid params !");
            callbackFunction(this.game, result);
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
            var movingArmies = [];
            var movable = Array.copy(fromTerritory.armies);

            for(var i = 0; i < moveNumber; i++) 
                movingArmies.push(movable.pop());

            this._placeArmiesFromTo(movingArmies, targetTerritory);            
        }

        var allDowns = [].concat(wins).concat(loses);

        for(var i in allDowns)
            this._destroyArmy(allDowns[i]);

        this.game.historic[that.turnCount].push(h);
        console.log(h.toString());

        // eval winner
        if (this.goalService.evalOnAttack(player, defensePlayer, h)) {
            this._gameEnded();
        };

        if (defensePlayer.armies.length == 0) {
            defensePlayer.destroyed = true;
        }

        callbackFunction(this.game, result);
    };

    GameServiceLocal.prototype.getMovableArmiesOf = function (player, territory){
        var that = this;
        var movable = territory.armies.filter(function(army){
            return !Array.has(that.movedArmies, army);
        });

        if (territory.armies.length == movable.length) {
            movable.pop(); // can't move occupation territory
        }

        return movable;
    };

    GameServiceLocal.prototype.moveArmies = function (player, fromTerritory, toTerritory, numberOfArmies, callbackFunction){
        var result = {
            message : '',
        };

        var movable = this.getMovableArmiesOf(player, fromTerritory);

        var that = this;

        if (movable.length < numberOfArmies) {
            result.message = "The territory has not this much armies to move !";
        } else {
            var moving = [];
            for(var i = 0; i < numberOfArmies; i++) {
                moving.push(movable.pop());
            }

            for(var i in moving)
                this.movedArmies.push(moving[i]);

            this._placeArmiesFromTo(moving, toTerritory);            
        }

        var h = {
            p : player,
            f : fromTerritory,
            t : toTerritory,
            n : numberOfArmies,
        };

        h.toString = function(){
            return "Player \"" + this.p.name + "\" moved " + this.n.toString() + " from \"" + 
                    this.f.name + "\" to \"" + this.t.name + "\".";
        };

        this.game.historic[that.turnCount].push(h);
        console.log(h.toString());

        // eval a winner
        if (this.goalService.evalOnMove(player, h)) {
            this._gameEnded();
        }

        callbackFunction(this.game, result);
    };

    /**
     * End the player turn of moviments
     **/
    GameServiceLocal.prototype.endMovimentTurn = function(player, callbackFunction){
        this._setCallbackOfPlayer(this.game.currentPlayer, callbackFunction);
        
        if (this.game.completed) {
            this._gameEnded();
            return;
        }

        this.game.currentPlayer = this._nextPlayer();

        if (this.game.currentPlayer == null) {
            this.game.state = App.Models.Game.States.Placement;
            this.game.currentPlayer = this.game.players[0];

            while (this.game.currentPlayer.destroyed) {
                this.game.currentPlayer = this._nextPlayer();
            }

            this._createNewArmies(); // give new armies to everyone

            this.turnCount = this.game.historic.length;
            this.game.historic.push([]);
        }

        this._endPlayerTurn();
        this._getCallbackOfPlayer(this.game.currentPlayer)(this.game);
    };

    GameServiceLocal.prototype.getNewArmiesForPlayer = function(player){
        var armies = player.armies.filter(function(a) {
            return a.territory == null;
        });

        return armies;
    };

    /**
     * End the player turn and call for the others... 
     **/
    GameServiceLocal.prototype.endPlaceTurn = function(player, callbackFunction){
        this._setCallbackOfPlayer(this.game.currentPlayer, callbackFunction);

        this.goalService.evalOnEndOfPlacement(player);

        if (this.game.completed) {
            this._gameEnded();
            return;
        }

        this.game.currentPlayer = this._nextPlayer();

        if (this.game.currentPlayer == null) {
            this.game.state = App.Models.Game.States.Attacking;
            this.game.currentPlayer = this.game.players[0];
                    
            this.turnCount = this.game.historic.length;
            this.game.historic.push([]);
        }

        this._endPlayerTurn();
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

        /*
        this.game.players.push(this._createPlayer("Real Person", ["Black"], [goals[6]]));
        this.game.players.push(this._createPlayer("AI 1", ["Red"], [goals[7]]));
        this.game.players.push(this._createPlayer("AI 2", ["Blue"], [goals[1]]));
        */

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

        this._createNewArmies(); // give new armies for the players

        // register and return
        this.history.push(this.game);
        this.game.historic[this.turnCount] = [];
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

    GameServiceLocal.prototype._gameEnded = function () {
        for(var p in this.game.players) {
            this._getCallbackOfPlayer(this.game.players[p])(this.game);
        }
    };

    GameServiceLocal.prototype._destroyArmy = function (army){
        Array.removeItem(army, army.territory.armies);
        Array.removeItem(army, army.player.armies);
        this.game.removeArmy(army);
    };

    GameServiceLocal.prototype._placeArmiesFromTo = function (armies, toTerritory){
        var army;
        while(army = armies.pop()) {
            if (army.territory != undefined)
                Array.removeItem(army, army.territory.armies);

            army.territory = toTerritory;
            toTerritory.armies.push(army);
        }
    }

    GameServiceLocal.prototype._endPlayerTurn = function(){
        while(this.movedArmies.pop()); // clean the array
    };

    GameServiceLocal.prototype._nextPlayer = function(){
        var index = this.game.players.indexOf(this.game.currentPlayer) + 1;

        if (index < this.game.players.length && index != -1) {
            var player =  this.game.players[index];

            if(player.destroyed)
                return this._nextPlayer();
            else
                return player;
        } else
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

    GameServiceLocal.prototype._getRandom = function (max) {
        return Math.floor((Math.random() * max));
    };

    // create helpers

    GameServiceLocal.prototype._createNewArmies = function (){
        var number = 0;
        for (var p in this.game.players) {
            if (this.game.players[p].destroyed == false) {
                number = Math.floor( this.game.players[p].territories.length / 2.0 );
                if (number < 3)
                    number = 3;
                for(var i = 0; i < number; i++)
                    this._createArmy(this.game.players[p]);
            }
        }
    };

    GameServiceLocal.prototype._createArmy = function(player, territory){
        var army = new App.Models.Army(uuid.v1(), player);

        if (territory) {
            army.territory = territory;
            territory.armies.push(army);
        }
        
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