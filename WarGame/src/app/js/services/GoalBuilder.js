(function (App) {

    var GoalBuilder = function (App) {
        this.app = App;
    };

    GoalBuilder.prototype = {
        app : null,
        __goalTypes : []
    };
    
    GoalBuilder.prototype.build = function (map, config) {

        if (!this.__goalTypes.hasOwnProperty(config.type))
            throw "There is no goal type registered got \"" + config.type + "\"";
        
        return new this.__goalTypes[config.type] (this.app, map, config);
    };
    
    GoalBuilder.prototype.register = function (name, classObj) {
        this.__goalTypes[name] = classObj;
    };

    App.GoalBuilder = new GoalBuilder(App);

})(window.App);