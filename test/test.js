var test = function(stdlib, foreign, heap) {
"use asm";
var HEAPU32 = new stdlib.Uint32Array(heap);
var malloc = foreign.malloc;
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
    var $00 = 0, mt = 0;
    var t2 = 0;
    mt = malloc(N << 2) >> 2;
    t2 = 4294967295;
    mt = 4294967295 & s;
    return 0 | 0;
}    
return { 
    init_genrand:init_genrand, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
