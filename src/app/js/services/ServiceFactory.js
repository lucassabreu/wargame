(function (App) {
    'use strict';

    var ServiceFactory = function (app) {
        this.app = app;
    };

    ServiceFactory.prototype = {
        app : null,
        services : {},

        register : function (name, obj) {
            this.services[name] = obj;
        },

        getService : function (name) {
            
            if (this.services.hasOwnProperty(name))
                return this.services[name];
            else
                throw "There is no service with the name: \"" + name + "\"";
        }
    };

    App.ServiceFactory = new ServiceFactory(App);
    App.ServiceFactory.register('service_factory', App.ServiceFactory);

})(window.App);