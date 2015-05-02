// helper array functions

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

Array.has = function(array, item){
    return array.indexOf(item) != -1;
};