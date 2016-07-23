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
    var $00 = 0, $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0, $06 = 0, $07 = 0, $08 = 0, $09 = 0, $10 = 0, $11 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0;
    var t2 = 0;
    $01 = mt + 1 | 0;
    $02 = $01 << 2;
    HEAPI32[$02>>2] = 42 | 0;
    for (mti = 1; mti < N; mti = mti + 1 | 0) {
        $03 = mti - 1 | 0;
        $04 = mt + $03 | 0;
        $05 = $04 << 2;
        $06 = HEAP[$05 >> 2] | 0;
        $07 = $06 >> 30;
        $08 = mti - 1 | 0;
        $09 = mt + $08 | 0;
        $10 = $09 << 2;
        $11 = HEAP[$10 >> 2] | 0;
        t2 = $11 ^ $07;
        $13 = mti + 0 | 0;
        $14 = mt + $13 | 0;
        $15 = $14 << 2;
        HEAPI32[$15>>2] = mti | 0;
        $16 = mti + 0 | 0;
        $17 = mt + $16 | 0;
        $18 = $17 << 2;
        HEAPI32[$18>>2] = 4294967295 | 0;
    }
    return 0 | 0;
}    
return { 
    init_genrand:init_genrand, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
