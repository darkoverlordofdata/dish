/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const MersenneTwister = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var HEAPU32 = new stdlib.Uint32Array(heap);
var malloc = foreign.malloc;
var free = foreign.free;
var N = 624;
var M = 397;
var MATRIX_A = 2567483615;
var UPPER_MASK = 2147483648;
var LOWER_MASK = 2147483647;
var mt = 0;
var mti = 625;
var mag01 = 0;
function init_genrand(s) {
    s = s | 0;
    var t0 = 0;
    var t1 = 0;
    var t2 = 0.0;
    var t3 = 0.0;
    mt = malloc(N << 2) | 0;
    mag01 = malloc(2 << 2) | 0;
    HEAPI32[mag01 + (0 << 2) >> 2] = 0 | 0;
    HEAPI32[mag01 + (1 << 2) >> 2] = MATRIX_A | 0;
    HEAPU32[mt + (0 << 2) >> 2] = s & 4294967295 | 0;
    for (mti = 1; (mti | (0 | 0)) < (N | (0 | 0)); mti = mti + 1 | 0) {
        t1 = HEAPU32[mt + (mti - 1 << 2) >> 2] | 0;
        t2 = +(t1|0);
        t3 = +(mti|0);
        t0 = ~~(+1812433253 * t2 + t3 | 0) | 0;
        HEAPU32[mt + (mti << 2) >> 2] = t0 & 4294967295 | 0;
    }
    return 0;
}
function genrand_int32() {
    var y = 0;
    var kk = 0;
    var z = 0;
    if ((mti | (0 | 0)) >= (N | (0 | 0))) {
        if ((mti | (0 | 0)) == (N + (1 | 0) | (0 | 0))) {
            init_genrand(5489 | 0);
        }
        for (kk = 0; (kk | 0 | (0 | 0)) < (N - M | (0 | 0)); kk = kk + 1 | 0) {
            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK;
            HEAPU32[mt + (kk << 2) >> 2] = HEAPU32[mt + (kk + M << 2) >> 2] | 0;
        }
        for (; (kk | 0 | (0 | 0)) < (N - (1 | 0) | (0 | 0)); kk = kk + 1 | 0) {
            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK | 0;
            HEAPU32[mt + (kk << 2) >> 2] = HEAPU32[mt + (kk + (M - N) << 2) >> 2] | 0;
        }
        y = mt[N - 1] & UPPER_MASK | mt[0] & LOWER_MASK | 0;
        HEAPU32[mt + (N - 1 << 2) >> 2] = HEAPU32[mt + (M - 1 << 2) >> 2] | 0;
        mti = 0 | 0;
    }
    y = HEAPU32[mt + (mti << 2) >> 2] | 0;
    mti = mti + 1 | 0;
    y = y ^ y >> 11 | 0;
    y = y ^ y << 7 & 2636928640 | 0;
    y = y ^ y << 15 & 4022730752 | 0;
    y = y ^ y >> 18 | 0;
    return y | 0;
}
function test(n, m) {
    n = n | 0;
    m = m | 0;
    var i = 0;
    var j = 0;
    var z = 0;
    for (i = 0 | 0; (i | 0 | (0 | 0)) < (n | 0 | (0 | 0)); i = i + 1 | 0) {
        for (j = 0 | 0; (j | 0 | (0 | 0)) < (m | 0 | (0 | 0)); j = j + 1 | 0) {
            z = genrand_int32() | 0;
        }
    }
}    
return { 
    genrand_int32:genrand_int32,
    test:test, 
};
}(Stdlib, Ffi, buffer))
for (let k in MersenneTwister) { 
    Ffi['MersenneTwister_'+k] = MersenneTwister[k] 
}
