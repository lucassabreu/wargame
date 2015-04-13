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
    
    /**
     * Set/Get the player who has this GoalCard
     */
    GoalCard.prototype.player = function (player) {
        if (arguments.length == 0)
            return this.__player;
        else {
            this.__player = player;

            for (var key in this.goals) {
                this.goals[key].player = player;
            }

            for (var key in this.otherwiseGoals) {
                this.otherwiseGoals[key].player= player;
            }
        }
    };
    
    /**
     * Verify the goals to confirm if the GoalCard has been completed
     */
    GoalCard.prototype.completed = function () {
        
        if (this.player() == null || this.player().destroyed)
            return false;
        
        var goals;
        
        if (this.failed == false)
            goals = this.goals;
        else
            goals = this.otherwiseGoals;
        
        for (var key in goals) {
            if (!goals[key].completed())
                return false;
        }

        return true;
    };
    
    App.Models.GoalCard = GoalCard;
})(window.App);