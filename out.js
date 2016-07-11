var test = function(stdlib, foreign, heap) {
"use asm";
var fround = stdlib.Math.fround;
var exp = stdlib.Math.exp;
var log = stdlib.Math.log;
var myFunc = foreign.myLib.myFunc;
var xInt = 0;
var fFloat = fround(0);
var zDouble = 0.0;
function logSum(x, y) {
    x = +x;
    y = y | 0;
    var z = 0;
    var x = 0;
    z = 42 + 13, x = 21;
    var i = 0;
    var j = 0;
    for (i = 0, j = 0; i < 10; i = i + 1, j = j + 1) {
        z = z - 1;
    }
    return +z;
}
function geometricMean() {
    var x = 0;
    x = 20;
    logSum(x, 10);
    while (x > 0) {
        x = x - 1;
    }
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
