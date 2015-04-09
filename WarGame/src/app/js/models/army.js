(function (App) {
    
    // Army entity
    var Army = function (id, player, color) {
    };
    
    Army.prototype = {
        id : null,
        player : null,
        color : null,
    };

    App.Models.Army = Army;
})(window.App);