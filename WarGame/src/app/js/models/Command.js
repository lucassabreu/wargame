(function (App) {

    var Command = function (player, type, params) {

        this.player = player;
        this.type = type;
        this.params = params;

    };

    Command.Types = {
        Place : 'Place',
        Attack : 'Attack',
        Move : 'Move',
    };

    Command.prototype = {
        player : null,
        type : '',
        params : {}
    };

    App.Models.Command = Command;

})(window.App);