(function(App) {
    
    var GoalServiceLocal = function (app) {
        this.app = app;
        this._goalCards = null;
        this._destroyMap = null;
        this._conquerContinentMap = null;
    };

    GoalServiceLocal.prototype = {
        app : null,
        _goalCards : [],
        _destroyMap : {},
    };

    GoalServiceLocal.prototype.__defineGetter__('gameService', function(){
        return this.app.ServiceFactory.getService('game_service');
    });

    GoalServiceLocal.prototype.__defineGetter__('game', function(){
        return this.gameService.getCurrentGame();
    });

    GoalServiceLocal.prototype.__defineGetter__('map', function(){
        return this.gameService.getCurrentMap();
    });

    GoalServiceLocal.prototype.__defineGetter__('goalCards', function() {
        if (this._goalCards == null) {
            this._goalCards = [];
            for(var p in this.game.players)
                this._goalCards.push(this.game.players[p].goalCard);
        }

        return this._goalCards;
    });

    GoalServiceLocal.prototype.__defineGetter__('destroyMap', function(){
        if (this._destroyMap == null) {
            this._destroyMap = {};
            for(var p in this.game.players) {
                if (this.game.players[p].goalCard.currentGoals[0] instanceof App.Models.Goals.DestroyArmyGoal)
                    this._destroyMap[this.game.players[p].goalCard.currentGoals[0].army] = this.game.players[p].goalCard;
            }
        }

        return this._destroyMap;
    });

    GoalServiceLocal.prototype.__defineGetter__('conquerContinentMap', function(){
        if (this._conquerContinentMap == null) {
            this._conquerContinentMap = {};
            for(var p in this.game.players) {
                var goals = this.game.players[p].goalCard.currentGoals;

                for(var g in goals) {
                    if (goals[g] instanceof App.Models.Goals.ConquerContinentGoal)
                        this._conquerContinentMap[goals[g].continent.name] = goals[g];
                }
            }
        }
        return this._conquerContinentMap;
    });

    GoalServiceLocal.prototype.evalFailedGoals = function(player){

        if (player.goalCard.failed)
            return true;

        var goals = player.goalCard.currentGoals;

        for(var i in goals) {
            if (goals[i] instanceof App.Models.Goals.DestroyArmyGoal) {
                if (goals[i].army == player.armyColor) {
                    goals[i].failed = true;
                    player.goalCard.failed = true;
                    return true;
                } else {
                    var enemies = this.gameService.game.players.filter(function(p) {
                        return p.armyColor == goals[i].army;
                    });

                    if (enemies.length == 0) {
                        goals[i].failed = true;
                        player.goalCard.failed = true;
                        return true;
                    } else {
                        if (enemies[0].armies.length == 0 && player.goalCard.completed == false) {
                            goals[i].failed = true;
                            player.goalCard.failed = true;
                            return true;
                        }
                    }
                }
            } else {
                goals[i].failed = false;
            }
        }

        return false;

    };

    GoalServiceLocal.prototype.evalOnEndOfPlacement = function(player){
        var goal = player.goalCard.currentGoals[0];

        if (!(goal instanceof App.Models.Goals.ConquerAnyTerritoriesGoal))
            return false;

        if (player.territories.length >= goal.quantity) {
            var territories = player.territories.filter(function (t){
                return t.armies.length >= goal.armyAtEachOne;
            });

            if (territories.length >= goal.quantity) {
                this._setWinner(player);
                return true;
            }
        }

        return false;
    };

    GoalServiceLocal.prototype.evalOnAttack = function(attack, defense, historic){

        if (this.destroyMap.hasOwnProperty(defense.armyColor)) { // someone want to kill this one?
            if (defense.armies.length == 0) {
                var goalCard = this.destroyMap[defense.armyColor];

                if (goalCard.player == attack) {
                    this._setWinner(attack);
                    return true;
                } else {
                    var goals = Array.copy(goalCard.currentGoals);
                    for(var i in goals) {
                        goals[i].failed = true;
                    }
                    goalCard.failed = true;
                }
            }            
        }

        if (historic.result.state != 'lost' && this.conquerContinentMap.hasOwnProperty(historic.from.continent.name)) {
            var goal = this.conquerContinentMap[historic.from.continent.name];
            if (goal.player != attack) {
                goal.completed = false; // inform the player that his goal isn't accomplished
            }
        }

        if (attack.goalCard.currentGoals[0] instanceof App.Models.Goals.ConquerContinentGoal) {
            var goals = Array.copy(attack.goalCard.currentGoals);
            var completed = true;

            for(var g in goals) {
                var goal = goals[g];
                var territories = goal.continent.territories.filter(function(t) {
                    return t.occupiedBy == goal.player;
                });

                if (territories.length != goal.continent.territories.length) {
                    goal.completed = false;
                    completed = false;
                } else {
                    goal.completed = true;
                }
            }

            if (completed) {
                this._setWinner(attack);
                return true;
            }
        }

        if (attack.goalCard.currentGoals[0] instanceof App.Models.Goals.ConquerAnyTerritoriesGoal) {
            return this.evalOnEndOfPlacement(attack);
        }

        return false;
    };

    GoalServiceLocal.prototype.evalOnMove = function(player, historic){
        return this.evalOnEndOfPlacement(player);
    };

    // internal

    GoalServiceLocal.prototype._setWinner = function (player) {

        for(var g in player.goalCard.currentGoals) {
            player.goalCard.currentGoals[g].completed = true;
        }
        player.goalCard.completed = true;

        this.game.state = App.Models.Game.States.Ended;
        this.game.winner = player;
    };

    App.ServiceFactory.register('goal_service', new GoalServiceLocal(App));

}) (window.App);