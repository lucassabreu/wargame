(function (App) {
    
    function Goal (app, map, config) {
        this.app = app;
        this.map = map;
    };
    
    Goal.prototype = {
        constructor : Goal,

        app : null,
        map : null,
        goalCard : null,
        player : null,
        completed : false,
        failed : false
    };

    Goal.prototype.__defineGetter__('goalType', function(){
        return this.constructor.name;
    });

    App.Models.Goals = {};
    App.Models.Goals.Goal = Goal;

})(window.App);