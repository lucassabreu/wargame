(function(App){

	var PlayerAIServiceLocal = function(App){
		this.app = App;
	};

	PlayerAIServiceLocal.GoalWeigth = {
		'DestroyArmyGoal' : 3,
		'ConquerContinentGoal' : 2,
		'ConquerOtherContinentsGoal' : 1,
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

	PlayerAIServiceLocal.prototype.executePlacementTurnOf = function(player){

		var goals = Array.copy(player.goalCard.currentGoals).filter(function(g) {
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

		goals = goalsControl.pop(); // must important current goals

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

				playerAI.executeAttackingTurnOf(player);
			};		
		})(player, this));
	};

	PlayerAIServiceLocal.prototype._placeArmiesByGoal = function(player, goal, armies){

		if ((goal instanceof App.Models.Goals.ConquerAnyTerritoriesGoal)) {
			var myTerrotories = this._queryTerritories(function(t){
				return t.occupiedBy == player && t.armies.length < goal.armyAtEachOne;
			});

			var territory, army;
			
			if (myTerrotories.length > 0) {
				while(armies.length > 0 && myTerrotories.length > 0) {
					territory = myTerrotories.pop();

					army = armies.pop();
					for(var i = territory.armies.length; i < goal.armyAtEachOne && army; i++) {
						this.gameService.placeArmyAt(player, army, territory);
						army = armies.pop();
					}
				}
			}

			if (armies.length > 0) {
				var myTerrotories = player.territories;
				var weigths = new Array(myTerrotories.length);
				var weigthFunction = function(t){
					return t.occupiedBy == player ? t.armies.length : 0;
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
					return p.w > c.w ? -1 : 1;
				});

				var army, territoryIndex = 0;
				while(army = armies.pop()) {
					this.gameService.placeArmyAt(player, army, weigths[territoryIndex++ % weigths.length].t);
				}
			}
		} else {
			if (goal instanceof App.Models.Goals.ConquerOtherContinentsGoal) {
				// todo : implement it !
			} else {

				if (goal instanceof App.Models.Goals.ConquerContinentGoal) {

					var territories = this._queryTerritories(function(t){
						return t.occupiedBy == player && t.continent == goal.continent;
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
					}
				} else { // App.Models.Goals.DestroyArmyGoal

					var territories = Array.copy(player.territories);
					var paths = [];
					var totalWeigth = 0;
					var weigths = [];
					var targets = this._queryTerritories(function(t){
						return t.armyColor == goal.army;
					});
					var weigthFunction = function(t) {
						return t.occupiedBy.armyColor == goal.army ? t.armies.length : 0;
					};

					for(var i in territories) {

						paths[i] = this._getShortestPathFromTo(territories[i], targets, weigthFunction);

						territoryWeigth = paths[i].reduce (function(p, c) {
							if (p instanceof Path)
								p = p.weigth / p.jumpsCount;

							return p + (c.weigth / c.jumpsCount);
						});

						weigths.push({
							t : territories[i],
							w : territoryWeigth
						});

						totalWeigth += territoryWeigth;
					}

					weigths = weigths.filter(function(w) {
						return w.w >= (totalWeigth / weigths.length);
					});

					var army;
					var wIndex = 0;
					while(army = armies.pop()) {
						this.gameService.placeArmyAt(player, army, weigths[wIndex++ % weigths.length].t);
					}
				}
			}
		}
	}

	// helpers

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