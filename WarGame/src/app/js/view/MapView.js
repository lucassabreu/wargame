(function (App, Snap) {
    
    var MapView = function (mapContainer, mapEntity) {
        this.snap = new Snap(jQuery(mapContainer).find('svg')[0]);
        this.map = mapEntity;
        
        this.feedback = {};
        
        this.feedback.overTerritory = this.snap.select('#overTerritory');
        this.feedback.attackTerritory = this.snap.select('#attackTerritory');
        this.feedback.selectedTerritory = this.snap.select('#selectedTerritory');
    };
    
    MapView.prototype = {
        
        feedback : null,
        
        snap : null,
        map : null,
        
        _lastOverTerritory : null,
        _lastClickedTerritory : null,

    };
    
    MapView.prototype.init = function () {
        var svgTer = null;
        var that = this;
        
        teste = this;
        
        this.feedback.overTerritory.click(function (evt) {
            that.selectTerritory(evt, that._lastOverTerritory);
        });
        
        this.feedback.selectedTerritory.click(function (evt) {
            that.cancelSelectTerritory(evt);
        });
        
        for (var key in this.map.territories) {
            var territory = this.map.territories[key];
            svgTer = this.snap.select(territory.query);
            svgTer.attr('territoryName', territory.name);
            
            svgTer.click(function (evt) {
                that.selectTerritory(evt, this);
            });
            
            svgTer.mouseover(function (evt) {
                that.mouseOverTerritory(evt, this);
            });
            
            svgTer.mouseout(function (evt) {
                that.mouseOutTerritory(evt, this);
            });
        }

    };
    
    MapView.prototype.selectTerritory = function (evt, element) {
        if (this._lastClickedTerritory != null 
                && this._lastClickedTerritory.attr('territoryName') == element.attr('territoryName')) {
            this.cancelSelectTerritory(evt);
        } else {
            this._lastClickedTerritory = element;
            this._lastOverTerritory = null;
            this.feedback.overTerritory.attr('d', '');
            this.feedback.selectedTerritory.attr('d', element.attr('d'));
        }
    };
    
    MapView.prototype.cancelSelectTerritory = function (evt) {
        this._lastClickedTerritory = null;
        this.feedback.selectedTerritory.attr('d', '');
    };
    
    MapView.prototype.mouseOverTerritory = function (evt, element) {
        this._lastOverTerritory = element;
        this.feedback.overTerritory.attr('d', element.attr('d'));
    };
    
    MapView.prototype.mouseOutTerritory = function (evt, element) {
        this.feedback.overTerritory.attr('d', element.attr('d'));
    };
    
    App.Views.MapView = MapView;

})(window.App, window.Snap);

var teste = null;