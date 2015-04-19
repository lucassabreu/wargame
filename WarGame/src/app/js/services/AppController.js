var AppController = function () {
    this.Models = {};
    this.angular = {};
};

AppController.ArmyColors = [
    'Black', 'Blue', 'Green', 'Whtie', 'Red', 'Yellow'
];

AppController.prototype = {
    angular : null,
    Models : null,

};

AppController.prototype.__defineGetter__('ArmyColors', function () {
    return AppController.ArmyColors.filter(function () { return true; });
});

/* centraliza todas as outras classes e valores abaixo dessa variável */
var App = new AppController();