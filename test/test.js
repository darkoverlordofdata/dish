var test = function(stdlib, foreign, heap) {
"use asm";
var exp = stdlib.Math.exp;
var log = stdlib.Math.log;
var now = foreign.usrlib.now;
function myFunc() {
    var $00 = 0, $01 = 0, $02 = 0;
    var i = 0;
    $01 = 42 * 3 | 0;
    $02 = 7 ^ $01;
    i = 21 & $02;
    return i | 0;
}
function logSum(start, end) {
    start = start | 0;
    end = end | 0;
    var $00 = 0, $01 = 0, $02 = 0;
    var sum = 0.0;
    var p = 0;
    var q = 0;
    var i = 0;
    var count = 0;
    var k = 0;
    var z = 0.0;
    count = end - start;
    k = start;
    $01 = 27 / 13 | 0;
    $02 = $01 + 42 | 0;
    z = 3 / $02 | 0;
    x = 21;
    k = 1 + k | 0;
    p = 2;
    for (k = start; (i | 0) < (end | 0); k = k + 1 | 0) {
        i = k;
    }
    for (i = start, k = 0; (i | 0) < (count | 0); i = i + 1 | 0, k = k + 1 | 0) {
        for (p = start, q = end; (p | 0) < (q | 0); p = p + 1 | 0) {
            sum = 1 + sum | 0;
        }
    }
    return +sum;
}    
return { 
    myFunc:myFunc,
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
