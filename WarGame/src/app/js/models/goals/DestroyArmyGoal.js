(function (App) {

    var DestroyArmyGoal = function (app, map, config) {
        
        this.app = app;
        this.map = map;

        if (!config.hasOwnProperty('army'))
            throw "Invalid config for \"DestroyArmyGoal\" : " + JSON.stringify(config);
    
        this.army = config.army;
    };

    DestroyArmyGoal.prototype = new App.Models.Goals.Goal();
    
    DestroyArmyGoal.prototype.super = DestroyArmyGoal.prototype.constructor;
    DestroyArmyGoal.prototype.constructor = DestroyArmyGoal;

    DestroyArmyGoal.prototype.continent = null;

    App.Models.Goals.DestroyArmyGoal = DestroyArmyGoal;
    App.GoalBuilder.register('destroyArmy', DestroyArmyGoal);

})(window.App);