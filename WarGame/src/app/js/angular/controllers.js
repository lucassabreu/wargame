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

            $scope.updateGameStatus = function(game){
                $scope.game = game;
                $scope.player = $scope.game.player;
                $scope.map = gameService.getCurrentMap();

                if ($scope.mapView) {
                    $scope.mapView.updateEntities($scope.game, $scope.map);
                    $scope.mapView.reDrawArmies();
                }
            };

            gameService.startGame(mapId, function(game) {

                $scope.updateGameStatus(game);

                // initializing the map
                var svgContainer = angular.element("#svgContainer");
                svgContainer.html(gameService.getSVG());
            
                $scope.mapView = new App.Views.MapView(svgContainer[0], $scope.game, $scope.map);
                $scope.mapView.init();
            });

            // arrays for control

            $scope.newArmies = [];
            $scope.lastCommands = [];

            // register boxes and buttons

            $scope.turnControls = {
                controls      : angular.element(".play-map-container .map-container .controls.turn"),
                attackButton  : angular.element(".play-map-container .map-container .btn-attack"),
                moveButton    : angular.element(".play-map-container .map-container .btn-move"),
                endTurnButton : angular.element(".play-map-container .map-container .btn-end-turn"),
                cancelButton  : angular.element(".play-map-container .map-container .btn-cancel"),
            };

            $scope.placeTurnControls = {
                controls        : angular.element(".play-map-container .map-container .controls.place-turn"),
                placeArmyButton : angular.element(".play-map-container .map-container .btn-place-army"),
                doneButton      : angular.element(".play-map-container .map-container .btn-done"),
            };

            $scope.messages = angular.element('.play-map-container .map-container .messages');
            $scope.goalCardDialog = angular.element(".play-map-container .goal-card");
            $scope.waitDialog = angular.element(".play-map-container .wait");

            $scope.goalCardDialog.hide();
            $scope.waitDialog.hide();
            $scope.turnControls.controls.hide();

            // events

            $scope.showCard = function(){
                $scope.goalCardDialog.show();
            };

            $scope.hideCard = function(){
                $scope.goalCardDialog.hide();
            };

            $scope.toogleAttack = function(){

                if($scope.mapView.isAttacking) {

                    if (!$scope.mapView.hasActiveTerritory || !$scope.mapView.hasActiveAttackTerritory) {
                        $scope.showMessage("No attack territory selected, you must select one !");
                        return false;
                    }

                    $scope.resetTurnControls();
                    $scope.turnControls.attackButton.text("Attack");
                    $scope.mapView.cancelAttack();
                } else {
                    if (!$scope.mapView.hasActiveTerritory) {
                        $scope.showMessage("No territory selected, you must select one !");
                        return false;
                    }

                    $scope.mapView.startAttackFrom($scope.mapView.activeTerritory);

                    $scope.resetTurnControls();
                    $scope.turnControls.cancelButton.attr('disabled', false);
                    $scope.turnControls.moveButton.attr('disabled', true);
                    $scope.turnControls.endTurnButton.attr('disabled', true);
                    $scope.turnControls.attackButton.text("Attack!");
                }

                return true;
            };

            $scope.cancel = function (){
                if ($scope.mapView.isAttacking)
                    $scope.mapView.cancelAttack();

                if ($scope.mapView.isMoving)
                    $scope.mapView.cancelMove();

                $scope.turnControls.attackButton.text("Attack");
                $scope.turnControls.moveButton.text("Move Army");
                
                $scope.resetTurnControls();
            };

            $scope.placeArmy = function(){
                if (!$scope.mapView.hasActiveTerritory) {
                    $scope.showMessage("No territory selected for placing... You still have " + ($scope.newArmies.length) + " to place !");
                    return false;
                }

                var army = $scope.newArmies.pop();
                gameService.placeArmyAt($scope.player, army, $scope.mapView.activeTerritory);
                $scope.mapView.placeArmyAt(army, $scope.mapView.activeTerritory);


                if ($scope.newArmies.length == 0) {
                    $scope.placeTurnControls.doneButton.attr('disabled', false);
                    $scope.placeTurnControls.placeArmyButton.attr('disabled', true);
                    $scope.showMessage("You completed your placement ! Hit the button 'Done!'");
                } else {
                    $scope.showMessage("You still have " + ($scope.newArmies.length) + " to place !");
                }
            };

            $scope.placeTurnDone = function(){
                $scope.waitDialog.show();
                $scope.showMessage("Waiting for others players to end theirs turns ...");
                gameService.endPlaceTurn ($scope.player, function(game) {
                    $scope.startMovimentTurn(game);
                });
            };

            // methods

            $scope.startPlaceTurn = function(){
                $scope.resetPlaceTurnControls();

                $scope.newArmies = gameService.getNewArmiesForPlayer($scope.player);
                $scope.lastCommands = [];

                $scope.showMessage("Place yours new " + ($scope.newArmies.length) + " armies !");
                $scope.mapView.startPlacingFor($scope.player);
            };

            $scope.startMovimentTurn = function(game){

                $scope.updateGameStatus(game);

                $scope.resetTurnControls();
                $scope.showMessage("It's your turn ! Make your moves !");

            };

            // helpers

            $scope.resetPlaceTurnControls = function(){
                $scope.placeTurnControls.placeArmyButton.attr('disabled', false);
                $scope.placeTurnControls.doneButton.attr('disabled', true);
            };

            $scope.resetTurnControls = function(){
                $scope.turnControls.attackButton.attr('disabled', false);
                $scope.turnControls.moveButton.attr('disabled', false);
                $scope.turnControls.endTurnButton.attr('disabled', false);
                $scope.turnControls.cancelButton.attr('disabled', true);
            };

            $scope.showMessage = function(message){
                $scope.messages.html(message);
            };

            // run for it

            $scope.startPlaceTurn();
        }
    ]);
    
    App.angular.controllers = controllers;

})(window.App);

var teste = null;