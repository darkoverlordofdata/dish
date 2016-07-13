var test3 = function(stdlib, foreign, heap) {
"use asm";
var log = stdlib.Math.log;
var now = foreign.usrlib.now;
function logSum(start, end) {
    start = start | 0;
    end = end | 0;
    var z = 0;
    var k = 0;
    z = 42;
    for (k = start; (k | 0) < (end | 0); k = k + 1 | 0) {
        z = z + k;
    }
    return z | 0;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
