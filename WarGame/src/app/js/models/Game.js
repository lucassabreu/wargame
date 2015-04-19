(function (App) {

    var Game = function (id, mapId) {
        this.id = id;
        this.mapId = mapId;
    };

    Game.prototype = {
        id : '',
        mapId : null,
        player : null,
        otherPlayers : [],
    };

    App.Models.Game = Game;

})(window.App);