(function (App) {
    
    // Army entity
    var Army = function (id, player) {
        this.id = id;
        this.player = player;
    };
    
    Army.prototype = {
        id : null,
        territory : null,
        _player : null,
    };

    Army.prototype.__defineSetter__('player', function(player){
        if (this._player) {
            var that = this;
            this._player.armies = this._player.armies.filter(function(a) { return that != a; });
        }

        this._player = player;
        this._player.armies.push(this);
    });

    Army.prototype.__defineGetter__('player', function(){
        return this._player;
    });

    Army.prototype.__defineGetter__('color', function(){
        return this.player.armyColor;
    });
    
    App.Models.Army = Army;
})(window.App);