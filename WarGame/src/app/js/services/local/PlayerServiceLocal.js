(function (App) {

    var PlayerServiceLocal = function (app) {

        this.app = app;
        this.players = [];
        this.__playersByColor = {};
        this.__commands = {};

    };

    PlayerServiceLocal.prototype = {

        app : null,
        players : [],
        
        __commands : {},
        __playersByColor : {},

    };
    
    PlayerServiceLocal.prototype.getPlayerByColor = function (color) {
        if (this.__playersByColor.hasOwnProperty(color))
            return this.__playersByColor[color];
        else
            return null;
    };
    
    PlayerServiceLocal.prototype.getPlayers = function () {
        return this.players;
    };
    
    App.ServiceFactory.register('player_service', new PlayerServiceLocal(App));

})(window.App);