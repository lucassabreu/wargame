(function (App) {
    
    var Goal = function (app, map, config) {
        this.app = app;
        this.map = map;
    };
    
    Goal.prototype = {
        app : null,
        map : null,
        goalCard : null,
        player : null,
        completed : false,
        failed : false
    };

    App.Models.Goals = {};
    App.Models.Goals.Goal = Goal;

})(window.App);