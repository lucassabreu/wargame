﻿(function (App, Snap) {
    
    var MapView = function (mapContainer, gameEntity, mapEntity) {

        teste = this;

        this.snap = new Snap(jQuery(mapContainer).find('svg')[0]);
        this.updateEntities(gameEntity, mapEntity);

        this._armies = [];
        this._attackTerritories = [];

        this.state = MapView.States.Placing;
        
        this.feedback = {
            overTerritory     : this.snap.select('#overTerritory'),
            attackTerritory   : this.snap.select('#attackTerritory'),
            selectedTerritory : this.snap.select('#selectedTerritory')
        };

        this.armySample = this.snap.select("#armySample");
        this.armySample.attr('visibility', "hidden");
    };

    MapView.State = function(state){
        this.state = state;
    };

    MapView.States = {
        Attacking : new MapView.State('Attacking'),
        Selecting : new MapView.State('Selecting'),
        Moving    : new MapView.State('Moving'),
        Placing   : new MapView.State('Placing'),
    };
    
    MapView.prototype = {
        
        state : null,
        
        snap : null,
        game : null,
        map : null,

        _currentPlayer : null,

        _attackTerritories : [],
        _armies : [],

        feedback : null,
        armySample : null,
        
        _lastOverTerritory : null,
        _lastClickedTerritory : null,

        _lastOverAttackTerritory : null,
        _lastClickedAttackTerritory : null,

    };

    // select help attributes

    MapView.prototype.__defineGetter__('activeTerritory', function(){
        if (this._lastClickedTerritory) {
            return this._getTerritory(this._lastClickedTerritory);
        } else {
            return null;
        }
    });

    MapView.prototype.__defineGetter__('hasActiveTerritory', function(){
        return this.activeTerritory != null;
    });

    // attack help attributes

    MapView.prototype.__defineGetter__('activeAttackTerritory', function(){
        if (this._lastClickedAttackTerritory) {
            return this._getTerritory(this._lastClickedAttackTerritory);
        } else
            return null;
    });

    MapView.prototype.__defineGetter__('hasActiveAttackTerritory', function(){
        return this.activeAttackTerritory != null;
    });

    // state help attributes

    MapView.prototype.__defineGetter__('isAttacking', function(){
        return this.state == MapView.States.Attacking;
    });

    MapView.prototype.__defineGetter__('isSelecting', function(){
        return this.state == MapView.States.Selecting;
    });

    MapView.prototype.__defineGetter__('isMoving', function(){
        return this.state == MapView.States.Moving;
    });

    MapView.prototype.__defineGetter__('isPlacing', function(){
        return this.state == MapView.States.Placing;
    });

    // internal helps

    MapView.prototype._getTerritory = function(territoryElement){
        return this.map.getTerritory(territoryElement.attr('territoryName'));
    };

    MapView.prototype._getTerritoryElement = function(territory){
        return this._getById(territory.query);
    };

    MapView.prototype._getTerritoryArmyElement = function(territory){
        return this._getById(territory.query + '_army');
    };

    MapView.prototype._getById = function(query){
        return this.snap.select('#' + query);
    };

    // methods for out call

    MapView.prototype.startPlacingFor = function(player){
        this.state = MapView.States.Placing;

        this._currentPlayer = player;
    };

    MapView.prototype.placeArmyAt = function(army, territory){
        var armyElement = this._getTerritoryArmyElement(territory);
        armyElement.select('.number-of-armies').node.textContent = territory.armies.length;
    };

    MapView.prototype.startAttackFrom = function(territory){
        this.state = MapView.States.Attacking;
        this._currentPlayer = territory.occupiedBy;

        this._selectTerritory(this._getById(territory.query));
        this._clearAttackTerritories();

        for(var key in territory.neighbors) {
            this._createAttackTerritory(territory.neighbors[key]);
        }
    };

    MapView.prototype.cancelAttack = function(){
        this.state = MapView.States.Selecting;
        this._clearAttackTerritories();
    };

    MapView.prototype.updateEntities = function(gameEntity, mapEntity){
        this.game = gameEntity;
        this.map = mapEntity;
    };

    MapView.prototype.reDrawArmies = function(){
        var armyElement;
        var that = this;

        while(armyElement = this._armies.pop()) {
            armyElement.remove();
        }

        this.armySample.attr('visibility', null);

        var territories = this.map.territories;
        for(var key in territories) {
            var territory = territories[key];

            armyElement = this.armySample.clone();

            armyElement.attr({
                id : territory.query + "_army",
                territoryName : territory.name,
                territoryQuery : territory.query,
            });

            armyElement.select(".army-block").attr("fill", territory.armyColor);
            armyElement.select(".number-of-armies").node.textContent = territory.armies.length;

            this._moveArmyElementTo(armyElement, territory);

            armyElement.mouseover(function(evt) {
                var element = that._getById(this.attr('territoryQuery'));
                that.onMouseOverTerritory(evt, element);
            });

            armyElement.click(function(evt){
                var element = this.attr('territoryQuery');

                if(that.isAttacking) {
                    that.onClickAttackTerritory(evt, that._getById(element + '_attack'));
                } else {
                    that.onClickTerritory(evt, that._getById(element));
                }
            });

            this.snap.append(armyElement);
            this._armies.push(armyElement);
        }

        this.armySample.attr('visibility', 'hidden');
    };

    MapView.prototype._moveArmyElementTo = function(armyElement, territory){
        armyElement.transform(Snap.matrix().translate(territory.center.x, territory.center.y));
    };

    // internal method helpers

    MapView.prototype._createAttackTerritory = function (territory) {
        var that = this;
        var attackTerritory = this.feedback.attackTerritory.clone();
        var territoryElement = this._getById(territory.query);

        attackTerritory.attr({ 
            id : territoryElement.attr('id') + '_attack', 
            d : territoryElement.attr('d'),
            territoryName : territory.name
        });

        attackTerritory.click(function(evt){
            that.onClickAttackTerritory(evt, this);
        });

        this._attackTerritories.push(attackTerritory);
    };

    MapView.prototype._clearAttackTerritories = function(){
        var territoryElement;
        while(territoryElement = this._attackTerritories.pop()) {
            territoryElement.remove();
        }
    };

    // attack territory events

    MapView.prototype._selectAttackTerritory = function(element){
        // confirm that is the only one
        this._cancelAttackTerritory();

        this._lastClickedAttackTerritory = element;
        this._lastClickedAttackTerritory.attr('opacity', '0.6');
    };

    MapView.prototype._cancelAttackTerritory = function(){
        if (!this.hasActiveAttackTerritory)
            return;

        this._lastClickedAttackTerritory.attr('opacity', '0.3');
        this._lastClickedAttackTerritory = null;
    };
    
    MapView.prototype.onClickAttackTerritory = function(evt, element){
        if (this.isAttacking) {
            if (this._lastClickedAttackTerritory
                && this._lastClickedAttackTerritory.attr('territoryName') == element.attr('territoryName'))
                this._cancelAttackTerritory();
            else
                this._selectAttackTerritory(element);
        }
    };

    // select territory events

    MapView.prototype._selectTerritory = function(territoryElement){
        this._lastClickedTerritory = territoryElement;
        this._lastOverTerritory = null;
        this.feedback.overTerritory.attr('d', '');
        this.feedback.selectedTerritory.attr('d', territoryElement.attr('d'));
    };

    MapView.prototype._cancelTerritory = function(){
        this._lastClickedTerritory = null;
        this.feedback.selectedTerritory.attr('d', '');
    };

    MapView.prototype.onClickTerritory = function (evt, element) {
        if (this.isSelecting || this.isPlacing) {
            if (this._lastClickedTerritory != null 
                && this._lastClickedTerritory.attr('territoryName') == element.attr('territoryName')) {
                this.onClickCancelTerritory(evt);
            } else {
                this._selectTerritory(element);
            }
        } 
    };
    
    MapView.prototype.onMouseOverTerritory = function (evt, element) {
        if (this.isSelecting || (this.isPlacing && this._getTerritory(element).occupiedBy == this._currentPlayer)) {
            this._lastOverTerritory = element;
            this.feedback.overTerritory.attr('d', element.attr('d'));
        } 
    };
    
    MapView.prototype.onClickCancelTerritory = function (evt) {
        if (this.isSelecting) {
            this._cancelTerritory();
        } 
    };

    // start the engine

    MapView.prototype.init = function () {
        var svgTer = null;
        var that = this;
        var territory;        
        
        this.feedback.overTerritory.click(function (evt) {
            that.onClickTerritory(evt, that._lastOverTerritory);
        });
        
        this.feedback.selectedTerritory.click(function (evt) {
            that.onClickCancelTerritory(evt);
        });
        
        for (var key in this.map.territories) {
            territory = this.map.territories[key];
            svgTer = this._getById(territory.query);
            svgTer.attr('territoryName', territory.name);
            
            svgTer.click(function (evt) {
                that.onClickTerritory(evt, this);
            });
            
            svgTer.mouseover(function (evt) {
                that.onMouseOverTerritory(evt, this);
            });
        }

        this.reDrawArmies();
    };
    
    App.Views.MapView = MapView;

})(window.App, window.Snap);

var teste = null;