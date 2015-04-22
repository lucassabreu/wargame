'use strict';

var gui = require("nw.gui");
var win = gui.Window.get();

win.width = "960px";
win.height = "520px";

Array.shuffle = function(array){
	window.knuthShuffle(array);
	return array;
};

Array.copy = function(array){
	return array.slice(0);
};

Array.remove = function(index, array){
	return array.splice(index, 1)[0];
};