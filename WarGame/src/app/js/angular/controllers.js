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
            $scope.gameService = gameService;

            $scope.updateGameStatus = function(game){
                $scope.game = game;
                $scope.player = $scope.game.currentPlayer;
                $scope.map = gameService.getCurrentMap();

                if ($scope.mapView) {
                    $scope.mapView.updateEntities($scope.game, $scope.map);
                    $scope.mapView.reDrawArmies();
                }
            };

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
            $scope.attackResultDialog = angular.element(".play-map-container .attack-result");
            $scope.attackDialog = angular.element(".play-map-container .attack");
            $scope.movingDialog = angular.element(".play-map-container .moving");

            $scope.attackResultDialog.hide();
            $scope.attackDialog.hide();
            $scope.movingDialog.hide();
            $scope.goalCardDialog.hide();
            $scope.waitDialog.hide();
            $scope.turnControls.controls.hide();

            // events

            $scope.toogleMove = function(){
                if ($scope.mapView.isMoving) {

                    if (!$scope.mapView.hasActiveTerritory || !$scope.mapView.hasActiveMoveTerritory) {
                        $scope.showMessage("No move territory selected, you must select one !");
                        return false;
                    }

                    var movableArmies = $scope.gameService.getMovableArmiesOf($scope.player, $scope.mapView.activeTerritory);

                    if (movableArmies.length == 0) {
                        $scope.showMessage("All armies has been moved before in this territory ! Choose other !");
                        return false;
                    }

                    $scope.moving = {
                        from     : $scope.mapView.activeTerritory,
                        to       : $scope.mapView.activeMoveTerritory,
                        quantity : 0,
                    };
                        
                    $scope.moving.max = (movableArmies.length);
                    $scope.moving.quantity = $scope.moving.max;

                    $scope.movingDialog.show();

                } else {
                    if (!$scope.mapView.hasActiveTerritory) {
                        $scope.showMessage("No territory selected, you must select one !");
                        return false;
                    }

                    if ($scope.mapView.activeTerritory.armies.length == 1) {
                        $scope.showMessage("You can't move the occupation army. Choose other territory !");
                        return false;
                    }

                    var movableArmies = $scope.gameService.getMovableArmiesOf($scope.player, $scope.mapView.activeTerritory);

                    if (movableArmies.length == 0) {
                        $scope.showMessage("All armies has been moved before in this territory ! Choose other !");
                        return false;
                    }

                    $scope.mapView.startMovingFrom ($scope.mapView.activeTerritory);

                    $scope.resetTurnControls();
                    $scope.turnControls.cancelButton.attr('disabled', false);
                    $scope.turnControls.attackButton.attr('disabled', true);
                    $scope.turnControls.endTurnButton.attr('disabled', true);
                    $scope.turnControls.moveButton.text("Move !");
                }
            };

            $scope.moveArmies = function(){
                $scope.gameService.moveArmies($scope.player, $scope.moving.from, $scope.moving.to, $scope.moving.quantity, 
                    function (game, result) {
                        $scope.updateGameStatus(game);

                        if (result.message != '')
                            $scope.showMessage("Move failed: " + result.message);
                        else 
                            $scope.moved = true;
                        
                        $scope.movingDialog.hide();

                        $scope.resetTurnControls();
                        $scope.turnControls.moveButton.text("Move Army");
                        $scope.mapView.endMoving();
                    }
                );

            };

            $scope.toogleAttack = function(){

                if($scope.mapView.isAttacking) {

                    if (!$scope.mapView.hasActiveTerritory || !$scope.mapView.hasActiveAttackTerritory) {
                        $scope.showMessage("No attack territory selected, you must select one !");
                        return false;
                    }

                    $scope.attack = {
                        from : $scope.mapView.activeTerritory,
                        target : $scope.mapView.activeAttackTerritory,
                        quantity : 0,
                    };

                    if ($scope.attack.from.armies.length > 4)
                        $scope.attack.max = 3;
                    else 
                        $scope.attack.max = $scope.attack.from.armies.length - 1;

                    $scope.attack.quantity = $scope.attack.max;

                    $scope.attackDialog.show();
                } else {
                    if (!$scope.mapView.hasActiveTerritory) {
                        $scope.showMessage("No territory selected, you must select one !");
                        return false;
                    }

                    if ($scope.mapView.activeTerritory.armies.length == 1) {
                        $scope.showMessage("To attack your territory needs more than 1 army. Choose other territory !");
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

            $scope.attackTerritory = function(){
                $scope.gameService.attackTerritory($scope.player, $scope.attack.from, $scope.attack.target, $scope.attack.quantity, 
                    function (game, result) {
                        $scope.updateGameStatus(game);
                        $scope.attack.result = result;

                        $scope.attackDialog.hide();
                        $scope.attackResultDialog.show();

                        $scope.resetTurnControls();
                        $scope.turnControls.attackButton.text("Attack");
                        $scope.mapView.endAttack();                      
                    }
                );
            };

            $scope.placeArmy = function(){
                if ($scope.newArmies.length == 0)
                    return false;

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
                if ($scope.placeTurnControls.doneButton.attr("disabled"))
                    return false;

                $scope.waitDialog.show();
                $scope.showMessage("Waiting for others players to end theirs turns ...");
                gameService.endPlaceTurn ($scope.player, function(game) {
                    $scope.startMovimentTurn(game);
                });
            };

            $scope.endTurn = function(){
                if ($scope.turnControls.endTurnButton.attr('disabled'))
                    return false;

                $scope.waitDialog.show();
                $scope.showMessage("Waiting for others players to end theirs turns ...");
                gameService.endMovimentTurn ($scope.player, function(game) {
                    $scope.startPlaceTurn(game);
                });
            };

            $scope.cancel = function (){
                if ($scope.mapView.isAttacking)
                    $scope.mapView.endAttack();

                if ($scope.mapView.isMoving)
                    $scope.mapView.endMoving();

                $scope.turnControls.attackButton.text("Attack");
                $scope.turnControls.moveButton.text("Move Army");
                
                $scope.resetTurnControls();
            };

            // methods

            $scope.startPlaceTurn = function(game){
                $scope.waitDialog.hide();

                $scope.moved = false;
                $scope.updateGameStatus(game);

                $scope.resetPlaceTurnControls();

                $scope.placeTurnControls.controls.show();
                $scope.turnControls.controls.hide();

                $scope.newArmies = gameService.getNewArmiesForPlayer($scope.player);
                $scope.lastCommands = [];

                $scope.showMessage("Place yours new " + ($scope.newArmies.length) + " armies !");
                $scope.mapView.startPlacingFor($scope.player);
            };

            $scope.startMovimentTurn = function(game){
                $scope.waitDialog.hide();

                $scope.moved = false;
                $scope.updateGameStatus(game);

                $scope.placeTurnControls.controls.hide();
                $scope.turnControls.controls.show();

                $scope.resetTurnControls();
                $scope.showMessage("It's your turn ! Make your moves !");
            };

            // dialog controls

            $scope.showCard = function(player){
                $scope.goalCard = player.goalCard;
                $scope.goalCardDialog.show();
            };

            $scope.hideCard = function(){
                $scope.goalCardDialog.hide();
            };

            $scope.closeAttack = function(){
                $scope.attackDialog.hide();
            };

            $scope.closeAttackResult = function(){
                $scope.attackResultDialog.hide();
            };

            $scope.closeMoving = function(){
                $scope.movingDialog.hide();
            };

            // helpers

            $scope.resetPlaceTurnControls = function(){
                $scope.placeTurnControls.placeArmyButton.attr('disabled', false);
                $scope.placeTurnControls.doneButton.attr('disabled', true);
            };

            $scope.resetTurnControls = function(){
                $scope.turnControls.attackButton.attr('disabled', $scope.moved);
                $scope.turnControls.moveButton.attr('disabled', false);
                $scope.turnControls.endTurnButton.attr('disabled', false);
                $scope.turnControls.cancelButton.attr('disabled', true);
            };

            $scope.showMessage = function(message){
                $scope.messages.html(message);
            };

            // initialize

            gameService.startGame(mapId, function(game) {

                $scope.updateGameStatus(game);

                // initializing the map
                var svgContainer = angular.element("#svgContainer");
                svgContainer.html(gameService.getSVG());
            
                $scope.mapView = new App.Views.MapView(svgContainer[0], $scope.game, $scope.map);
                $scope.mapView.init();

                $scope.startPlaceTurn(game);
            });
        }
    ]);
    
    App.angular.controllers = controllers;

})(window.App);

var teste = null;