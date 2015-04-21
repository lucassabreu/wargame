(function (App) {
    'use strict';

    var fs = require('fs');
    var controllers = angular.module("warGameControllers", []);
    
    controllers.controller("MainCtrl", [
        "$scope",
        function ($scope) {
            
            $scope.closeApp = function () {
                win.close();
            };
        }
    ]);
    
    controllers.controller("ChooseMapCtrl", [
        '$scope',
        function ($scope) {
            
            $scope.maps = [];
            
            var mapService = App.ServiceFactory.getService('map_service');
            $scope.maps = mapService.getMapsInfo();
        }
    ]);
    
    controllers.controller('PlayMapCtrl', [
        '$scope', '$routeParams', 
        function ($scope, $routeParams) {
            
            var mapId = $routeParams['map'];
            var gameService = App.ServiceFactory.getService("game_service");

            $scope.game = gameService.startGame(mapId);
            var game = $scope.game;

            $scope.player = game.player;
            $scope.map = gameService.getCurrentMap();
            
            var svgContainer = angular.element("#svgContainer");
            svgContainer.html(gameService.getSVG());
            
            $scope.mapView = new App.Views.MapView(svgContainer[0], $scope.map);
            $scope.mapView.init();
        }
    ]);
    
    App.angular.controllers = controllers;

})(window.App);

var teste = null;