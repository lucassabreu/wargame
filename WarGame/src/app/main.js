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

Array.removeItem = function(item, array){
	return array.splice(array.indexOf(item), 1)[0];
};