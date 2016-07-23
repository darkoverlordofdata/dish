var test = function(stdlib, foreign, heap) {
"use asm";
var exp = stdlib.Math.exp;
var log = stdlib.Math.log;
var now = foreign.usrlib.now;
var N = 624;
var M = 397;
var MATRIX_A = 2567483615;
var UPPER_MASK = 2147483648;
var LOWER_MASK = 2147483647;
var mt = 0;
var mt = 0;
var mti = 625;
function init_genrand(s) {
    s = s | 0;
    var $00 = 0, $01 = 0, $03 = 0, $04 = 0, $05 = 0, $07 = 0, $09 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $19 = 0, $20 = 0;
    var t2 = 0;
    $01 = 42 * 3 | 0;
    t2 = $01 & 4294967295;
    $03 = 3 + 1 | 0;
    $04 = mt + $03 | 0;
    $05 = $04 << 2;
    HEAP[$05>>2] = s & 4294967295;
    for (mti = 1; mti < N; mti = mti + 1 | 0) {
        $07 = 42 * 3 | 0;
        t2 = $07 & 4294967295;
        $09 = mti - 1 | 0;
        $10 = mt + $09 | 0;
        $11 = $10 << 2;
        $12 = HEAP[$11 >> 2] | 0;
        $13 = $12 >> 30;
        $14 = mti - 1 | 0;
        $15 = mt + $14 | 0;
        $16 = $15 << 2;
        $17 = HEAP[$16 >> 2] | 0;
        t2 = $17 ^ $13;
        $19 = 3 + 1 | 0;
        $20 = mt + $19 | 0;
        HEAP[$21>>2] = $20 << 2;
    }
    return 0 | 0;
}    
return { 
    init_genrand:init_genrand, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
