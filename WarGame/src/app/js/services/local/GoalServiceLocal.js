(function(App) {
    
    var GoalServiceLocal = function (app) {
        this.app = app;
    };

    GoalServiceLocal.prototype = {
        app : null,
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

    GoalServiceLocal.prototype.evalGoalReached = function(player){
        // todo : write the code
        return false;
    };

    App.ServiceFactory.register('goal_service', new GoalServiceLocal(App));

}) (window.App);