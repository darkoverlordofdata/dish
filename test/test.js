var test = function(stdlib, foreign, heap) {
"use asm";
var exp = stdlib.Math.exp;
function logSum(start, end) {
    start = start | 0;
    end = end | 0;
    var mt = 0;
    var mti = 0;
    var i = 0;
    i = mt[mti] & 4294967295;
    return i | 0;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
