(function(App) {
    var angularApp = angular.module("warGameApp", ['warGameControllers', 'ngRoute']);

    angularApp.config(['$routeProvider', 
        function ($routeProvider) {
            $routeProvider.
            when('/main', {
                templateUrl : "routes/main.html",
                controller: "MainCtrl"
            }).
        
            when('/chooseMap', {
                templateUrl : "routes/choose-map.html",
                controller : "ChooseMapCtrl"
            }).

            when("/map/:map/detail", {
                templateUrl : "routes/map-detail.html",
                controller : "MapDetailCtrl"
            }).
        
            when('/play/:map', {
                templateUrl : "routes/play.html",
                controller : "PlayMapCtrl"
            }).
        
            otherwise({
                redirectTo : "/main",
            });
        }
    ]);

    App.angular.app = angularApp;
}) (window.App)