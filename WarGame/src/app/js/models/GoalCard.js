(function (App) {
    
    var GoalCard = function (map, text, goals, otherwiseText, otherwiseGoals) {
        this.map = map;
        this.__player = null,
        this.text = text;
        this.otherwiseText = otherwiseText;
        
        this.goals = [];
        this.otherwiseGoals = [];
        
        for (var key in goals)
            this.addGoal(goals[key]);
        
        for(var key in otherwiseGoals)
            this.addOtherwiseGoal(otherwiseGoals[key]);
    }
    
    GoalCard.prototype = {
        __player : null,
        map : null,
        text : '',
        otherwiseText : '',
        goals : [],
        otherwiseGoals : [],

        completed : false,
        failed : false
    }﻿
    
    GoalCard.prototype.addGoal = function (goal) {
        goal.goalCard = this;
        this.goals.push(goal);
    };

    GoalCard.prototype.addOtherwiseGoal = function (goal) {
        goal.goalCard = this;
        this.otherwiseGoals.push(goal);
    };

    GoalCard.prototype.__defineGetter__('currentGoals', function(){
        if (!this.failed)
            return this.goals;
        else
            return this.otherwiseGoals;
    });
    
    /**
     * Set/Get the player who has this GoalCard
     */
    GoalCard.prototype.__defineSetter__('player', function (player) {
        this.__player = player;

        for (var key in this.goals) {
            this.goals[key].player = player;
        }

        for (var key in this.otherwiseGoals) {
            this.otherwiseGoals[key].player = player;
        }
    });

    GoalCard.prototype.__defineGetter__('player', function(){
        return this.__player;
    });
    
    App.Models.GoalCard = GoalCard;

})(window.App);