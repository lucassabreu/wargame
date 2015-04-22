(function (App) {

    var MapBuilder = function (App) {
        this.app = App;
    };

    MapBuilder.prototype = {
        app : null,
    };
    
    /**
     * Build a Map object based at a MapModelType
     */
    MapBuilder.prototype.buildMap = function (mapModelType) {

        var continents = this.__buildContinents(mapModelType.continents);
        var map = new App.Models.Map(mapModelType.id, mapModelType.name, continents, mapModelType.image);

        var goalCards = this.__buildGoalCards(map, mapModelType.goalCards)
        map.goalCards = goalCards;
        
        Mapa = map;

        return map;
    };
    
    MapBuilder.prototype.__buildGoalCards = function (map, config) {

        var goalCards = [];
        var otherwiseText = '';
        
        for (var key in config) {
            var goals = [];
            var otherwiseGoals = [];

            for (var gKey in config[key].goals) {
                goals.push(this.__buildGoal(map, config[key].goals[gKey]));
            }

            if (config[key].hasOwnProperty('otherwiseText')) {
                otherwiseText = config[key].otherwiseText;

                for (var gKey in config[key].otherwise) {
                    otherwiseGoals.push(this.__buildGoal(map, config[key].otherwise[gKey]));
                }
            } else {
                otherwiseText = '';
            }
            
            //console.log(goals);

            goalCards.push(new App.Models.GoalCard(
                map, 
                config[key].goalText, 
                goals,
                otherwiseText,
                otherwiseGoals
            ));
        }

        return goalCards;
    };
    
    MapBuilder.prototype.goalBuilder = function () {
        return this.app.GoalBuilder;
    };

    MapBuilder.prototype.__buildGoal = function (map, config) {
        return this.goalBuilder().build(map, config);
    };

    MapBuilder.prototype.__buildContinents = function (config) {
        
        var continents = [];
        var contTerritories;
        
        var allTerritories = {};
        
        // read all the continents and territories
        for (var contKey in config) {

            contTerritories = [];

            for (var terKey in config[contKey].territories) {
                
                var territory = new App.Models.Territory(
                    config[contKey].territories[terKey].name.trim(),
                    // only the string id list, not the atual territory
                    config[contKey].territories[terKey].neighbors, 
                    config[contKey].territories[terKey].query.trim(),
                    config[contKey].territories[terKey].center
                );

                // map all the territories bu the name
                allTerritories[territory.name] = territory;
                contTerritories.push(territory);
            }

            var continent = new App.Models.Continent(
                config[contKey].name, 
                contTerritories, 
                config[contKey].bonusArmy
            );

            continents.push(continent);
        }
        
        // update the neighborns in all territories with the atual territory object
        this.__updateNeighborns(allTerritories);

        return continents;
    };
    
    MapBuilder.prototype.__updateNeighborns = function (territoriesHashMap) {
        
        var neighborns;

        for (var key in territoriesHashMap) {
            
            neighborns = [];

            for (var neighbornKey in territoriesHashMap[key].neighbors) {
                
                territoriesHashMap[key].neighbors[neighbornKey] = territoriesHashMap[key].neighbors[neighbornKey].trim();

                if (territoriesHashMap.hasOwnProperty(
                    territoriesHashMap[key].neighbors[neighbornKey])) {
                    neighborns.push(territoriesHashMap[territoriesHashMap[key].neighbors[neighbornKey]]);
                } else
                    throw "There is no Territory with the name \"" + territoriesHashMap[key].neighbors[neighbornKey] + "\"";

            }

            territoriesHashMap[key].neighbors = neighborns;
        }

    }

    App.MapBuilder = new MapBuilder(App);

})(window.App);