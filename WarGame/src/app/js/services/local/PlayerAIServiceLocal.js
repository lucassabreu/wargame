(function(App){

	var PlayerAIServiceLocal = function(App){
		this.app = App;
	};

	PlayerAIServiceLocal.prototype = {
		app : null,
		game : null,
	};

	App.ServiceFactory.register('player_ai_service', new PlayerAIServiceLocal(App));

})(window.App);