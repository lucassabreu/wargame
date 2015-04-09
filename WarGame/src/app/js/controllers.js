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

            console.log(mapService.getMapsInfo());
        }
    ]);
    
    App.angular.controllers = controllers;

}) (window.App);