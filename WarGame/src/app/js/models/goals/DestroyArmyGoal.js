(function (App) {

    function DestroyArmyGoal (app, map, config) {
        
        this.app = app;
        this.map = map;

        if (!config.hasOwnProperty('army'))
            throw "Invalid config for \"DestroyArmyGoal\" : " + JSON.stringify(config);

        var armyColor = App.getValidArmyColor (config.army);

        if (!armyColor)
            throw new "Invalid army color for \"DestroyArmyGoal\" : " + JSON.stringify(config);
    
        this.army = armyColor;
    };

    DestroyArmyGoal.prototype = new App.Models.Goals.Goal();
    
    DestroyArmyGoal.prototype.super = DestroyArmyGoal.prototype.constructor;
    DestroyArmyGoal.prototype.constructor = DestroyArmyGoal;

    DestroyArmyGoal.prototype.army = null;

    App.Models.Goals.DestroyArmyGoal = DestroyArmyGoal;
    App.GoalBuilder.register('destroyArmy', DestroyArmyGoal);

})(window.App);