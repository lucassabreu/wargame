
var app = angular.module("warGameApp", ['warGameControllers', 'ngRoute']);

app.config(['$routeProvider', 
    function ($routeProvider) {
        $routeProvider.
        when('/main', {
            templateUrl : "routes/main.html",
            controller: "MainCtrl"
        }).
        
        when('/chooseMap', {
            templateUrl : "routes/chooseMap.html",
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
