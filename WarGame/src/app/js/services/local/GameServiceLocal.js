(function (App) {
    'use strict';
    
    var GameServiceLocal = function (App) {
        this.app = App;
        this.history = [];
    };

    GameServiceLocal.prototype = {
        app : null,
        map : null,
        game : null,
        history : []
    };
    
    GameServiceLocal.prototype.__defineGetter__('playerService', function () {
        return this.app.ServiceFactory.getService('player_service');
    });

    GameServiceLocal.prototype.__defineGetter__('mapService', function () {
        return this.app.ServiceFactory.getService('map_service');
    });
    
    GameServiceLocal.prototype.startGame = function (mapId) {
        this.map = this.mapService.getMap(mapId);

        this.game = new App.Models.Game(uuid.v1(), this.map.id);
        
        this.game.player = new App.Models.Player();
        
        var colors = App.ArmyColors.filter(function () { return true; });
        
        this.game.player.armyColor = colors[this._getRandom(colors.length)];

        this.history.push(this.game);
        return this.game;
    };
    
    GameServiceLocal.prototype.getSVG = function () {
        return this.mapService.getSVG(this.map.id);
    };

    GameServiceLocal.prototype.getCurrentGame = function () {
        return this.game;
    };
    
    GameServiceLocal.prototype.getCurrentMap = function () {
        return this.map;
    };
    
    GameServiceLocal.prototype.getPlayers = function () {
        return this.playerService.getPlayers();
    };
    
    GameServiceLocal.prototype._getRandom = function (max) {
        return Math.floor((Math.random() * max) + 1);
    };

    App.ServiceFactory.register('game_service', new GameServiceLocal(App));

})(window.App);