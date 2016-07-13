var test = function(stdlib, foreign, heap) {
"use asm";
var exp = stdlib.Math.exp;
var log = stdlib.Math.log;
var now = foreign.usrlib.now;
function logSum(start, end) {
    start = start | 0;
    end = end | 0;
    var sum = 0.0;
    var p = 0;
    var q = 0;
    var i = 0;
    var count = 0;
    var k = 0;
    count = start;
    k = start;
    k = k + 1, p = 2;
    for (k = start; (i | 0) < (start | 0); k = k + 1 | 0) {
        i = k;
    }
    for (i = start, k = 0; (i | 0) < (count | 0); i = i + 1 | 0, k = k + 1 | 0) {
        for (p = start, q = end; (p | 0) < (q | 0); p = p + 1 | 0) {
            sum = sum + 1;
        }
    }
    return +sum;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
