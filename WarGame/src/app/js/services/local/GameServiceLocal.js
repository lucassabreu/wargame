(function (App) {

    var GameServiceLocal = function (App) {
        this.app = App;
    };

    GameServiceLocal.prototype = {
        app : null,
        map : null,

    };
    
    GameServiceLocal.prototype.__defineGetter__('playerService', function () {
        return this.app.ServiceFactory.getService('player_service');
    });

    GameServiceLocal.prototype.__defineGetter__('mapService', function () {
        return this.app.ServiceFactory.getService('map_service');
    });
    
    GameServiceLocal.prototype.startGame = function (mapId) {
        this.map = this.mapService.getMap(mapId);

    };
    
    GameServiceLocal.prototype.getCurrentMap = function () {
        return this.map;
    };
    
    GameServiceLocal.prototype.getPlayers = function () {
        return this.playerService.getPlayers();
    };
    
    App.ServiceFactory.register('game_service', new GameServiceLocal(App));

})(window.App);