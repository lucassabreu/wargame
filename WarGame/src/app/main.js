'use strict';

var Mapa;

var gui = require("nw.gui");
var win = gui.Window.get();

win.width = "960px";
win.height = "520px";

/* centraliza todas as outras classes e valores abaixo dessa variável */
var App = {
    angular : {},
    Models : {},
};