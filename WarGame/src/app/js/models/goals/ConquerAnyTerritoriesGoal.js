(function (App) {

    var ConquerAnyTerritoriesGoal = function (app, map, config) {
        
        this.app = app;
        this.map = map;
        
        if (!config.hasOwnProperty('quantity') || !config.hasOwnProperty('armyAtEachOne'))
            throw "Invalid config for \"ConquerAnyTerritoriesGoal\" : " + JSON.stringify(config);
        
        this.quantity = parseInt(config.quantity);
        this.armyAtEachOne = parseInt(config.armyAtEachOne);
    };

    ConquerAnyTerritoriesGoal.prototype = new App.Models.Goals.Goal();
    
    ConquerAnyTerritoriesGoal.prototype.super = ConquerAnyTerritoriesGoal.prototype.constructor;
    ConquerAnyTerritoriesGoal.prototype.constructor = ConquerAnyTerritoriesGoal;

    ConquerAnyTerritoriesGoal.prototype.quantity = 0;
    ConquerAnyTerritoriesGoal.prototype.armyAtEachOne = 0;

    App.Models.Goals.ConquerAnyTerritoriesGoal = ConquerAnyTerritoriesGoal;
    App.GoalBuilder.register('conquerAnyTerritories', ConquerAnyTerritoriesGoal);

})(window.App);