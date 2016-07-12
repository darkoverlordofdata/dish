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
    count = 1000;
    for (i = start, k = 0; (i | 0) < (count | 0); i = i + 1, k = k + 1) {
        for (p = start, q = end; (p | 0) < (q | 0); p = p + 1) {
            sum = sum + HEAPF64[p];
        }
    }
    return +sum;
}    
return {  
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
