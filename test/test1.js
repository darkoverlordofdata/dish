var test1 = function(stdlib, foreign, heap) {
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
    count =     $01 = start - end | 0;;
    k = ;
    k =     $01 = 1 + k | 0;, p = ;
    for (k = ;         $01 = 0 | end;
        $02 = 0 | i;
        $03 = $01 < $02 | 0;; k =         $01 = 1 + k | 0;
        $02 = 0 | $01;) {
        i = ;
    }
    for (i = , k = ;         $01 = 0 | count;
        $02 = 0 | i;
        $03 = $01 < $02 | 0;; i =         $01 = 1 + i | 0;
        $02 = 0 | $01;, k =         $01 = 1 + k | 0;
        $02 = 0 | $01;) {
        for (p = , q = ;             $01 = 0 | q;
            $02 = 0 | p;
            $03 = $01 < $02 | 0;; p =             $01 = 1 + p | 0;
            $02 = 0 | $01;) {
            sum =             $01 = 1 + sum | 0;;
        }
    }
    return;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
