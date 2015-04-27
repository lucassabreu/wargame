(function (App) {

    function ConquerOtherContinentsGoal (app, map, config) {
        
        this.app = app;
        this.map = map;
        
        if (!config.hasOwnProperty('quantity') || !config.hasOwnProperty('armyAtEachOne'))
            throw "Invalid config for \"ConquerOtherContinentsGoal\" : " + JSON.stringify(config);
        
        this.quantity = parseInt(config.quantity);
        this.armyAtEachOne = parseInt(config.armyAtEachOne);
    };

    ConquerOtherContinentsGoal.prototype = new App.Models.Goals.Goal();
    
    ConquerOtherContinentsGoal.prototype.super = ConquerOtherContinentsGoal.prototype.constructor;
    ConquerOtherContinentsGoal.prototype.constructor = ConquerOtherContinentsGoal;

    ConquerOtherContinentsGoal.prototype.quantity = 0;
    ConquerOtherContinentsGoal.prototype.armyAtEachOne = 0;

    App.Models.Goals.ConquerOtherContinentsGoal = ConquerOtherContinentsGoal;
    App.GoalBuilder.register('conquerOtherContinents', ConquerOtherContinentsGoal);

})(window.App);