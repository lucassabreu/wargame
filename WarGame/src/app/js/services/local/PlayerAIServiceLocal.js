(function(App){

    var PlayerAIServiceLocal = function(App){
        this.app = App;
        this.graphs = {};
    };

    PlayerAIServiceLocal.GoalWeigth = {
        'DestroyArmyGoal' : 2,
        'ConquerContinentGoal' : 1,
        'ConquerAnyTerritoriesGoal' : 0,
    };

    PlayerAIServiceLocal.prototype = {
        app : null,
        game : null,

        graphs : {}
    };

    PlayerAIServiceLocal.prototype.__defineGetter__('goalWeigth', function(){
        return PlayerAIServiceLocal.GoalWeigth;
    });

    PlayerAIServiceLocal.prototype.__defineGetter__('gameService', function(){
        return this.app.ServiceFactory.getService('game_service');
    });

    PlayerAIServiceLocal.prototype.__defineGetter__('game', function(){
        return this.gameService.getCurrentGame();
    });

    PlayerAIServiceLocal.prototype.__defineGetter__('map', function(){
        return this.gameService.getCurrentMap();
    });

    PlayerAIServiceLocal.prototype.__defineGetter__('players', function(){
        return this.game.players;
    });

    // ai

    // moviment turn ...

    PlayerAIServiceLocal.prototype.executeMovimentTurnOf = function(player){
        var goals = this._mustImportantGoals(player.goalCard.currentGoals);

        this.executeAttackMoviments (player, goals); // do attacks
        this.executeMovesMoviments (player, goals);    // move the armies

        this.gameService.endMovimentTurn (player, (function(player, playerAI){
            return function(game){
                if (game.completed)
                    return;

                playerAI.executePlacementTurnOf(player);
            };        
        }) (player, this));
    };

    PlayerAIServiceLocal.prototype.executeAttackMoviments = function (player, goals){
        var that = this;
        var goal = goals[0];
                
        switch (goal.goalType) {
            case 'DestroyArmyGoal':
                var territories;
                var neighbors;
                var numberOfArmies = 0;

                // attack closest goals

                territories = player.territories.filter(function (t) {
                    return that._getWeigthOf(t, 1, function(n) {
                        return t.armies.length > 1 && n.armyColor == goal.army;
                    })
                }).sort(function(p, c) {
                    return c.armies.length > p.armies.length ? -1 : 1; // strongest first 
                });

                for (var t in territories) {

                    this._attackNeighborsFromTo (territories[t], function(territory) {
                        neighbors = territory.neighbors.filter(function(n) {
                            return n.armyColor == goal.army;
                        });

                        neighbors.sort(function(p, c) {
                            return c.armies.length > p.armies.length ? 1 : -1; // tiniest ones first
                        });

                        return neighbors;
                    });

                }

                // attack to get closer to goals

                territories = player.territories.filter(function (t){
                    return t.armies.length > 1 && !that._isInnerTerritory(t);
                });

                if (territories.length > 0) {
                    var targets = this._queryTerritories (function(t) {
                        return t.armyColor == goal.army;
                    });

                    for(var t in territories) {
                        this._attackNeighborsFromTo (territories[t], function (t) {
                            var paths = that._getShortestPathFromTo (t, targets, function (t) {
                                return t.armyColor == goal.army ? 0 : 1;
                            }).sort(function (p, c) {
                                return c.weigth > p.weigth ? -1 : 1;
                            });

                            var neighbors = [];
                            for (var p in paths) {
                                if (paths[p].jumps[1].territory.occupiedBy != player && !Array.has(neighbors, paths[p].jumps[1].territory))
                                    neighbors.push(paths[p].jumps[1].territory); // get the first jump (must be a neighbor)
                            }

                            return neighbors;
                        });
                    }
                }
            break;
            case 'ConquerContinentGoal':
                var continents = [];
                for(var g in goals) {
                    continents.push(goals[g].continent);
                }

                var territories = player.territories.filter(function (t) {
                    return Array.has(continents, t.continent) && t.armies.length > 1;
                });

                for (var t in territories) {
                    this._attackNeighborsFromTo (territories[t], function (t) {
                        var neighbors = t.neighbors.filter (function (n) {
                            return n.occupiedBy != player && Array.has(continents, n.continent);
                        });
                        return neighbors.sort (function (p, c) {
                            return c.armies.length > p.armies.length ? -1 : 1;
                        });
                    });
                }

                territories = player.territories.filter (function (t) {
                    return t.armies.length > 1;
                });

                if (territories.length > 0) {
                    var targets = this._queryTerritories (function (t) {
                        return Array.has(continents, t.continent) && t.occupiedBy != player;
                    });

                    for(var t in territories) {
                        this._attackNeighborsFromTo (territories[t], function (t) {
                            var paths = that._getShortestPathFromTo (t, targets, function (t) {
                                return Array.has(continents, t.continent) ? 0 : 1;
                            }).sort(function (p, c) {
                                return c.weigth < p.weigth ? -1 : 1;
                            });

                            var neighbors = [];
                            for (var p in paths) {
                                if (paths[p].jumps.length > 1 && paths[p].jumps[1].territory.occupiedBy != player)
                                    neighbors.push(paths[p].jumps[1].territory); // get the first jump (must be a neighbor)
                            }

                            goals;
                            return neighbors;
                        });
                    }
                }
            break;
            case 'ConquerAnyTerritoriesGoal':

                var minArmy;

                if (player.territories.length >= goals[i].quantity)
                    minArmy = goal.armyAtEachOne;
                else {
                    minArmy = 1;
                }

                var territories = player.territories.filter (function (t) {
                    return t.armies.length > minArmy;
                });

                for (var t in territories) {
                    this._attackNeighborsFromTo (territories[t], function(t) {
                        return t.neighbors.filter(function(n) {
                            return n.occupiedBy != player;
                        }).sort(function(p, c) {
                            return c.armies.length > p.armies.length ? 1 : -1;
                        });
                    }, minArmy);
                }
            break;
        }
    };

    PlayerAIServiceLocal.prototype._attackNeighborsFromTo = function (from, neighborsSelector, minArmy){
        var neighbors = neighborsSelector(from);
        var that = this;

        if (!minArmy)
            minArmy = 1;

        for (var n in neighbors) {
            if (from.armies.length <= minArmy)
                break;

            if (neighbors[n].occupiedBy != from.occupiedBy) {
                var numberOfArmies = from.armies.length - minArmy;

                if (numberOfArmies > 3)
                    numberOfArmies = 3;

                this.gameService.attackTerritory(from.occupiedBy, from, neighbors[n], numberOfArmies, function(game, result) {
                    if (game.completed)
                        return;

                    that._attackNeighborsCallback (game, result, from, neighbors[n], minArmy, neighborsSelector);
                });
            }
        }
    };

    PlayerAIServiceLocal.prototype._attackNeighborsCallback = function (game, result, from, to, minArmy, neighborsSelector){
        if (result.state == 'occupied') {
            if (to.armies.length > minArmy) {
                this._attackNeighborsFromTo(to, neighborsSelector);
            }
        } else {
            if (from.armies.length > minArmy) {
                var numberOfArmies = from.armies.length - minArmy;
                var that = this;
                if (numberOfArmies > 3) numberOfArmies = 3;
                this.gameService.attackTerritory(from.occupiedBy, from, to, numberOfArmies, function(game, result) {
                    if (game.completed)
                        return;

                    that._attackNeighborsCallback (game, result, from, to, minArmy, neighborsSelector); // call itself
                });
            }
        }
    };

    // move armies

    PlayerAIServiceLocal.prototype.executeMovesMoviments = function (player, goals){
        var neighborSelector;
        var that = this;
        var goalType = goals[0].goalType;

        switch (goalType) {
            case 'DestroyArmyGoal':
                var goal = goals[0];
                var territories = player.territories.filter(function(t) {
                    return that._canMoveArmies(t);
                });

                var targets = this._queryTerritories (function(t) {
                    return t.armyColor == goal.army;
                });

                neighborSelector = function (t) {
                    var paths = that._getShortestPathFromTo(t, targets, function(t) {
                        return t.armyColor == goal.army ? 0 : 1;
                    }).filter(function(p) {
                        return p.jumps[1].territory.occupiedBy == player;
                    }).sort(function(p, c) {
                        return c.weigth > p.weigth ? -1 : 1;
                    });

                    if (paths.length == 0)
                        return null;
                    else
                        return paths[0].jumps[1].territory;
                };

                for (var t in territories) {
                    this._moveArmiesToNeighbor(territories[t], neighborSelector);
                }
            break;
            case 'ConquerContinentGoal':
                var continents = [];

                for(var g in goals) {
                    continents.push(goals[g].continent);
                }

                var territories = player.territories.filter(function(t) {
                    return that._canMoveArmies(t) && !Array.has(continents, t.continent);
                });
                var targets = this._queryTerritories (function(t) {
                    return Array.has(continents, t.continent) && t.occupiedBy != player;
                });

                neighborSelector = function(t) {
                    var paths = that._getShortestPathFromTo(t, targets, function(t) {
                        return Array.has(continents, t.continent) ? 0 : 1;
                    }).sort(function(p, c) {
                        return c.weigth > p.weigth ? -1 : 1;
                    });

                    if (paths.length > 0 && paths[0].weigth == 1) {
                        return null; 
                    }

                    paths = paths.filter(function(p) {
                        return p.jumps.length > 1 && p.jumps[1].territory.occupiedBy == player;
                    });

                    if (paths.length == 0)
                        return null;
                    else
                        return paths[0].jumps[1].territory;
                };

                for (var t in territories) {
                    this._moveArmiesToNeighbor(territories[t], neighborSelector);
                }

                // move to enemies inner the continent

                territories = player.territories.filter(function(t) {
                    return that._canMoveArmies(t);
                });
                targets = this._queryTerritories(function(t) {
                    return Array.has(continents, t.continent) && t.occupiedBy != player;
                });

                neighborSelector = function(t) {
                    var paths = that._getShortestPathFromTo (t, targets, function(t) {
                        return Array.has(continents, t.continent) ? 1 : 0;
                    }).filter(function(p) {
                        return p.jumps[1].territory.occupiedBy == player;
                    }).sort(function(p, c) {
                        return c.weigth > p.weigth ? -1 : 1;
                    });

                    if (paths.length > 0 && paths[0].weigth == 1) {
                        return null; 
                    }

                    paths = paths.filter(function(p) {
                        return p.jumps.length > 1 && p.jumps[1].territory.occupiedBy == player;
                    });

                    if (paths.length == 0)
                        return null;
                    else
                        return paths[0].jumps[1].territory;
                };

                for(var t in territories) {
                    this._moveArmiesToNeighbor(territories[t], neighborSelector);
                }

                // move the armies inner the continent to the border

                territories = player.territories.filter(function(t) {
                    return Array.has(continents, t.continent) && that._isInnerTerritory(t);
                });
                targets = this._queryTerritories(function(t) {
                    return t.occupiedBy != player;
                });

                neighborSelector = function(t) {
                    var paths = that._getShortestPathFromTo (t, targets, function(t) {
                        return Array.has(continents, t.continent) ? 1 : 0;
                    }).filter(function(p) {
                        return p.jumps[1].territory.occupiedBy == player;
                    }).sort(function(p, c) {
                        return c.weigth > p.weigth ? -1 : 1;
                    });

                    if (paths.length == 0)
                        return null;
                    else
                        return paths[0].jumps[1].territory;
                };

                for(var t in territories) {
                    this._moveArmiesToNeighbor(territories[t], neighborSelector);
                }
            break;
            case 'ConquerAnyTerritoriesGoal':
                var goal = goals[0];
                var territories = player.territories.filter(function(t) {
                    return t.armies.length > goal.armyAtEachOne;
                });
                var targets = this._queryTerritories (function (t) {
                    return t.occupiedBy != player;
                });

                neighborSelector = function (t) {

                    if (t.armies.length < goal.armyAtEachOne)
                        return null;

                    var neighbors = t.neighbors.filter(function(n) {
                        return n.occupiedBy == t.occupiedBy && n.armies.length < goal.armyAtEachOne;
                    });

                    if (neighbors.length > 0) {
                        var movable = that.gameService.getMovableArmiesOf(n).length - goal.armyAtEachOne;
                        for (var n in neighbors) {
                            if (movable <= 0)
                                break;
                            movable--;
                            this.gameService.moveArmies(t.occupiedBy, t, neighbors[n], 1, function(game, result) {
                                // do nothing
                            });
                        }

                        return null;
                    } 

                    if (that._canMoveArmies(t)) {
                        var paths = that._getShortestPathFromTo(innerTerritories[t], targets, function(t) {
                            return t.occupiedBy == player ? 1 : 0;
                        }).filter(function(p) {
                            return p.jumps[1].territory.occupiedBy == player;
                        }).sort(function(p, c) {
                            return c.weigth > p.weigth ? -1 : 1;
                        });

                        if (paths.length == 0)
                            return null;
                        else
                            return paths[0].jumps[1].territory;
                    }
                };

                for (var t in territories) {
                    this._moveArmiesToNeighbor (territories[t], neighborSelector);
                }
            break;
        }
    };

    PlayerAIServiceLocal.prototype._canMoveArmies = function (t) {
        return this.gameService.getMovableArmiesOf(t.occupiedBy, t).length > 0;
    };

    PlayerAIServiceLocal.prototype._moveArmiesToNeighbor = function (t, neighborSelector) {
        var movable = this.gameService.getMovableArmiesOf(t.occupiedBy, t).length;
        if (movable > 0) {
            var toTerritory = neighborSelector(t);
            var that = this;

            if (toTerritory != null) {
                this.gameService.moveArmies(t.occupiedBy, t, toTerritory, movable, function(game, result) {
                    if (game.completed)
                        return;

                    that._moveArmiesToNeighbor(toTerritory, neighborSelector);
                });
            }
        }
    };

    // placement turn ...

    PlayerAIServiceLocal.prototype.executePlacementTurnOf = function(player){

        var goals = this._mustImportantGoals(player.goalCard.currentGoals);

        var armies = this.gameService.getNewArmiesForPlayer(player);
        var armiesForGoal = new Array(goals.length);

        for(var i = 0; i < armiesForGoal.length; i++)
            armiesForGoal[i] = [];

        var count = Math.floor(armies.length / goals.length);

        for(var i = 0; i < goals.length; i++) {
            for(var j = 0; j < count; j++)
                armiesForGoal[i].push(armies.pop());
        }

        if (armies.length > 0) {
            var army, i = 0;
            while(army = armies.pop()) {
                armiesForGoal[i].push(army);
            }
        }

        for(var i in goals) {
            this._placeArmiesByGoal (player, goals[i], armiesForGoal[i]);
        }

        this.gameService.endPlaceTurn(player, (function(player, playerAI){
            return function(game){
                if (game.completed)
                    return;

                playerAI.executeMovimentTurnOf(player);
            };        
        })(player, this));
    };

    PlayerAIServiceLocal.prototype._placeArmiesByGoal = function(player, goal, armies){
        var that = this;

        switch (goal.goalType) {

            case 'ConquerAnyTerritoriesGoal':
                if (player.territories.length >= goal.quantity) {
                    var myTerrotories = player.territories.filter(function(t){
                        return t.armies.length < goal.armyAtEachOne;
                    });

                    var territory, army;

                    if (myTerrotories.length > 0) {
                        while(armies.length > 0 && myTerrotories.length > 0) {
                            territory = myTerrotories.pop();

                            for(var i = territory.armies.length; i < goal.armyAtEachOne && armies.length > 0; i++) {
                                army = armies.pop();
                                this.gameService.placeArmyAt(player, army, territory);
                            }
                        }
                    }
                }

                if (armies.length > 0) {
                    var myTerrotories = player.territories.filter(function(t){
                        return !that._isInnerTerritory(t);
                    });
                    var weigths = new Array(myTerrotories.length);
                    var weigthFunction = function(t){
                        return t.occupiedBy == player ? 0 : 1;
                    };

                    var totalWeigth = 0;
                    var weigthObject;
                    for(var i in myTerrotories) {
                        weigths.push(weigthObject = {
                            t : myTerrotories[i],
                            w : this._getWeigthOf(myTerrotories[i], 2, weigthFunction),
                        });

                        totalWeigth += weigthObject.w;
                    }

                    var med = totalWeigth / weigths.length;
                    weigths = weigths.filter(function(w){
                        return w.w >= med;
                    }).sort(function(p, c){
                        return c.w > p.w ? 1 : -1;
                    });

                    var army, territoryIndex = 0;
                    while(army = armies.pop()) {
                        this.gameService.placeArmyAt(player, army, weigths[territoryIndex++ % weigths.length].t);
                    }
                }
            break;
            case 'ConquerContinentGoal':
                var territories = player.territories.filter(function(t) {
                    if (that._isInnerTerritory(t))
                        return false;

                    for(var n in t.neighbors) {
                        if (t.neighbors[n].continent == goal.continent &&
                            t.neighbors[n].occupiedBy != player)
                            return true;
                    }
                    return false;
                });

                if (territories.length > 0) {
                    var army;
                    var tIndex = 0;
                    while(army = armies.pop()) {
                        this.gameService.placeArmyAt(player, army, territories[tIndex++ % territories.length]);
                    }
                } else {
                    territories = player.territories.filter(function(t){
                        return t.continent == goal.continent && !that._isInnerTerritory(t);
                    });

                    if (territories.length > 0) {
                        var weigths = [];
                        var weigth, totalWeigth = 0;
                        var weigthFunction = function(t) {
                            return t.occupiedBy == player ? t.armies.length : 0;
                        };

                        for(var i in territories) {
                            weigth = this._getWeigthOf(territories[i], 2, weigthFunction);
                            weigths.push({
                                t : territories[i],
                                w : weigth,
                            });

                            totalWeigth += weigth;
                        }

                        weigths = weigths.filter(function(w) {
                            return w.w >= (totalWeigth / weigths.length);
                        });

                        var army;
                        var wIndex = 0;
                        while(army = armies.pop()) {
                            this.gameService.placeArmyAt(player, army, weigths[wIndex++ % weigths.length].t);
                        }
                    } else {
                        var targets = this._queryTerritories(function(t) {
                            return t.continent == goal.continent;
                        });

                        territories = player.territories.filter(function(t) {
                            return !that._isInnerTerritory(t);
                        });

                        var paths = [];
                        var totalDistance = 0;
                        var distances = [];
                        var distance = 0;

                        for(var i in territories) {
                            paths = this._getShortestPathFromTo(territories[i], targets).sort(function(p, c) {
                                return c.jumpsCount > p.jumpsCount ? -1 : 1;
                            });

                            distance = paths[0].jumpsCount;
                            distances.push({
                                t : territories[i],
                                d : distance,
                            });
                            totalDistance += distance;
                        }

                        distances = distances.filter(function(d) {
                            return d.d <= (totalDistance / distances.length);
                        }).sort(function(p, c) {
                            return c.d > p.d ? -1 : 1;
                        });

                        var army;
                        var dIndex = 0;
                        while(army = armies.pop()) {
                            this.gameService.placeArmyAt(player, army, distances[dIndex++ % distances.length].t);
                        }
                    }
                }
            break;
            case 'DestroyArmyGoal':

                var territories = player.territories.filter(function(t) {
                    return !that._isInnerTerritory(t);
                });

                var paths;
                var totalWeigth = 0;
                var weigths = [];
                var targets = this._queryTerritories(function(t){
                    return t.armyColor == goal.army;
                });
                var weigthFunction = function(t) {
                    return t.armyColor == goal.army ? t.armies.length : 0;
                };

                for(var i in territories) {

                    paths = this._getShortestPathFromTo(territories[i], targets, weigthFunction).sort(function(p, c) {
                        return c.jumpsCount > p.jumpsCount ? -1 : 1;
                    });

                    territoryWeigth = paths[0].jumpsCount;

                    weigths.push({
                        t : territories[i],
                        w : territoryWeigth
                    });

                    totalWeigth += territoryWeigth;
                }

                weigths = weigths.filter(function(w) {
                    return w.w <= (totalWeigth / weigths.length);
                }).sort(function(p, c) {
                    return c.w > p.w ? -1 : 1; 
                });

                var army;
                var wIndex = 0;
                while(army = armies.pop()) {
                    this.gameService.placeArmyAt(player, army, weigths[wIndex++ % weigths.length].t);
                }
            break;
        }
    };

    // helpers

    PlayerAIServiceLocal.prototype._isInnerTerritory = function (territory) {
        for (var n in territory.neighbors) {
            if (territory.neighbors[n].occupiedBy != territory.occupiedBy)
                return false;
        }

        return true;
    };

    PlayerAIServiceLocal.prototype._mustImportantGoals = function (goals) {
        var goals = goals.filter(function(g) {
            return !g.completed && !g.failed;
        });

        var goalsControl = [];

        for(var i in goals) {
            if (!goalsControl[this._getGoalWeigth(goals[i])])
                goalsControl[this._getGoalWeigth(goals[i])] = [];

            goalsControl[this._getGoalWeigth(goals[i])].push(goals[i]);
        }

        goalsControl = goalsControl.filter(function(g) {
            return g !== undefined;
        });

        return goalsControl.pop(); // must important current goals
    };

    PlayerAIServiceLocal.prototype._getGoalWeigth = function(goal){
        return this.goalWeigth[goal.goalType];
    };

    PlayerAIServiceLocal.prototype._getShortestPathFromTo = function(fromTerritory, toTerritories, weigthFunction){

        if (arguments.length == 2)
            weigthFunction = function(){ return -1; };

        if (!toTerritories.hasOwnProperty('length'))
            toTerritories = [toTerritories];

        var paths = new Array(toTerritories.length);
        var jumps;
        var territory;

        for(var i in toTerritories) {
            jumps = this._dijkstraShortestPath(fromTerritory, toTerritories[i], this.map);

            for(var j in jumps) {
                territory = this.map.getTerritory(jumps[j]);
                jumps[j] = new Jump(territory, weigthFunction(territory));
            }

            paths[i] = new Path(jumps);
        }

        return paths;
    };

    PlayerAIServiceLocal.prototype._getWeigthOf = function(territory, distance, weigthFunction, _walked){

        var weigth = weigthFunction(territory);

        if (arguments.length < 4)
            _walked = [];
        
        _walked.push(territory); // only to know if it was read before

        if (distance > 0) {
            for(var i in territory.neighbors) {
                if (_walked.indexOf(territory.neighbors[i]) == -1)
                    weigth += this._getWeigthOf(territory.neighbors[i], distance - 1, weigthFunction, _walked);
            }
        }

        return weigth;
    };

    PlayerAIServiceLocal.prototype._dijkstraShortestPath = function (fromTerritory, toTerritory, map){
        return this._getGraph(map).findShortestPath(fromTerritory.name, toTerritory.name);        
    };

    PlayerAIServiceLocal.prototype._getGraph = function (map){
        if (this.graphs.hasOwnProperty(map.id))
            return this.graphs[map.id];

        var vertex = {};

        for(var i in map.territories) {
            vertex[map.territories[i].name] = {};

            for(var j in map.territories[i].neighbors) {
                vertex[map.territories[i].name][map.territories[i].neighbors[j].name] = 1; // distance between the vertex
            }
        }

        return this.graphs[map.id] = new Graph(vertex);
    }

    PlayerAIServiceLocal.prototype._queryTerritories = function(filterFunction){
        return this.map.territories.filter(filterFunction);
    }

    var Jump = function (territory, weigth) {
        this.territory = territory;
        this.weigth = weigth;
    }

    Jump.prototype = {
        territory : null,
        weigth : 0,
    };

    var Path = function(jumps){
        this.jumps = jumps;
        this.jumpsCount = jumps.length;
        this.weigth = 0;

        for(var i in jumps) {
            this.weigth += jumps[i].weigth;
        }
    };

    Path.prototype = {
        jumps : [],
        weigth : 0,
        jumpsCount : 0,
    }

    PlayerAIServiceLocal.Paths = {
        Path : Path,
        Jump : Jump
    };

    App.ServiceFactory.register('player_ai_service', new PlayerAIServiceLocal(App));

})(window.App);