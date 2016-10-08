(function (App) {

    function ConquerContinentGoal (app, map, config) {
        
        this.app = app;
        this.map = map;

        if (!config.hasOwnProperty('continent'))
            throw "Invalid config for \"ConquerContinentGoal\" : " + JSON.stringify(config);
    
        this.continent = map.getContinent(config.continent);

        if (!this.continent || this.continent == null)
            throw "Continent \"" + config.continent + "\" was not found in the map";
    };

    ConquerContinentGoal.prototype = new App.Models.Goals.Goal();
    
    ConquerContinentGoal.prototype.super = ConquerContinentGoal.prototype.constructor;
    ConquerContinentGoal.prototype.constructor = ConquerContinentGoal;

    ConquerContinentGoal.prototype.continent = null;

    App.Models.Goals.ConquerContinentGoal = ConquerContinentGoal;
    App.GoalBuilder.register('conquerContinent', ConquerContinentGoal);

})(window.App);