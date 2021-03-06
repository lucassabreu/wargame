﻿var AppController = function () {
    this.Models = {};
    this.Views = {};
    this.angular = {};
};

AppController.ArmyColors = [
    'Black', 'Blue', 'Green', 'White', 'Red', 'Yellow'
];

AppController.prototype = {
    angular : null,
    Models : null,
    Views : null,
};

AppController.prototype.__defineGetter__('ArmyColors', function () {
    return AppController.ArmyColors.filter(function () { return true; });
});

AppController.prototype.getValidArmyColor = function(color){
    color = color.toLowerCase();

    for(var i in this.ArmyColors) {
        if (this.ArmyColors[i].toLowerCase() == color)
            return this.ArmyColors[i];
    }

    return null;
};

/* centraliza todas as outras classes e valores abaixo dessa variável */
var App = new AppController();