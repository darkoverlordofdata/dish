var tester = function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
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
    mt = malloc(N << 2) >> 2;
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
function genrand_int32() {
    var $00 = 0, $01 = 0;
    var y = 0;
    var mag01 = 0;
    mag01 = malloc(2 << 2) >> 2;
    if (mti >= N) {
        var kk = 0;
        if (mti == N + 1) {
            init_genrand(5489);
        }
        mti = 0;
    }
    $01 = y >> 11;
    y = y ^ $01;
    return y | 0;
}    
return { 
    genrand_int32:genrand_int32, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
