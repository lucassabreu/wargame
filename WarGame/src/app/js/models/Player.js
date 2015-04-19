(function (App) {

    var Player = function () {
        this._goalCards = [];
        this.continents = [];
        this.continents = [];
    };

    Player.prototype = {
        armyColor : '',
        _goalCards : [],
        territories : [],
        continents : []
    };
    
    Player.prototype.__defineGetter__('goalCards', function () {
        return this._goalCards;
    });

    App.Models.Player = Player;

})(window.App);