(function (App) {

    var Player = function (name) {
        this.name = name;
        this.armies = [];
    };

    Player.prototype = {
        name : '',
        armyColor : '',
        _goalCard : null,
        armies : [],
        real : false,
    };
    
    Player.prototype.__defineGetter__('territories', function(){
        var territoriesObj = {};

        for(var i in this.armies) {
            if (this.armies[i].territory)
                territoriesObj[this.armies[i].territory.name] = this.armies[i].territory;
        }

        var territories = [];

        for(var key in territoriesObj)
            territories.push(territoriesObj[key]);

        return territories;
    });

    Player.prototype.__defineSetter__('goalCard', function(goalCard){
        this._goalCard = goalCard;
        this._goalCard.player = this;
    })

    Player.prototype.__defineGetter__('goalCard', function(){
        return this._goalCard;
    })

    Player.prototype.__defineGetter__('completedGoals', function(){
        return this.goalCard.completed;
    });

    App.Models.Player = Player;

})(window.App);