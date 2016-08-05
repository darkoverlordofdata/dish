/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const MersenneTwister = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI8 = new stdlib.Int8Array(heap);
var HEAPU8 = new stdlib.Uint8Array(heap);
var HEAPI16 = new stdlib.Int16Array(heap);
var HEAPU16 = new stdlib.Uint16Array(heap);
var HEAPI32 = new stdlib.Int32Array(heap);
var HEAPU32 = new stdlib.Uint32Array(heap);
var HEAPF32 = new stdlib.Float32Array(heap);
var HEAPF64 = new stdlib.Float64Array(heap);
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
    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __10__ = 0, __11__ = 0, __12__ = 0, __13__ = 0, __14__ = 0, __15__ = 0, __16__ = 0, __18__ = 0, __19__ = 0, __20__ = 0;
    var t0 = 0;
    var t1 = 0;
    var t2 = 0.0;
    var t3 = 0.0;
    mt = (malloc(N << 2) | 0) >> 2;
    mag01 = (malloc(2 << 2) | 0) >> 2;
    __01__ = mag01 + 0 | 0;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = 0 | 0;
    __03__ = mag01 + 1 | 0;
    __04__ = __03__ << 2;
    HEAPI32[__04__ >> 2] = MATRIX_A | 0;
    __05__ = mt + 0 | 0;
    __06__ = __05__ << 2 | 0;
    __07__ = s & 4294967295 | 0;
    HEAPU32[__06__ >> 2] = __07__ | 0;
    for (mti = 1; (mti | 0) < (N | 0); mti = mti + 1 | 0) {
        __08__ = mti - 1 | 0;
        __09__ = mt + __08__ | 0;
        __10__ = __09__ << 2;
        __11__ = HEAPI32[__10__ >> 2] | 0;
        __12__ = __11__ >> 30;
        __13__ = mti - 1 | 0;
        __14__ = mt + __13__ | 0;
        __15__ = __14__ << 2;
        __16__ = HEAPI32[__15__ >> 2] | 0;
        t1 = __16__ ^ __12__;
        t2 = +(t1 | 0);
        t3 = +(mti | 0);
        t0 = ~~(+1812433253 * t2 + t3) | 0;
        __18__ = mt + mti | 0;
        __19__ = __18__ << 2 | 0;
        __20__ = t0 & 4294967295 | 0;
        HEAPU32[__19__ >> 2] = __20__ | 0;
    }
    return 0 | 0;
}
function genrand_int32() {
    var __00__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __10__ = 0, __12__ = 0, __13__ = 0, __14__ = 0, __15__ = 0, __16__ = 0, __17__ = 0, __18__ = 0, __19__ = 0, __20__ = 0, __21__ = 0, __22__ = 0, __23__ = 0, __24__ = 0, __25__ = 0, __26__ = 0, __27__ = 0, __28__ = 0, __29__ = 0, __30__ = 0, __31__ = 0, __32__ = 0, __33__ = 0, __35__ = 0, __36__ = 0, __37__ = 0, __38__ = 0, __39__ = 0, __40__ = 0, __41__ = 0, __42__ = 0, __43__ = 0, __44__ = 0, __45__ = 0, __46__ = 0, __47__ = 0, __48__ = 0, __49__ = 0, __50__ = 0, __51__ = 0, __52__ = 0, __53__ = 0, __54__ = 0, __55__ = 0, __56__ = 0, __57__ = 0, __59__ = 0, __60__ = 0, __61__ = 0, __62__ = 0, __63__ = 0, __64__ = 0, __65__ = 0, __66__ = 0, __67__ = 0, __68__ = 0, __69__ = 0, __70__ = 0, __71__ = 0, __72__ = 0, __73__ = 0, __74__ = 0, __77__ = 0, __79__ = 0, __80__ = 0, __82__ = 0, __83__ = 0, __85__ = 0;
    var y = 0;
    var kk = 0;
    var z = 0;
    if ((mti | 0) >= (N | 0)) {
        if ((mti | 0) == (N + 1 | 0)) {
            z = init_genrand(5489) | 0;
        }
        for (kk = 0; (kk | 0 | 0) < (N - M | 0); kk = kk + 1 | 0) {
            __02__ = kk + 1 | 0;
            __03__ = mt + __02__ | 0;
            __04__ = __03__ << 2;
            __05__ = HEAPI32[__04__ >> 2] | 0;
            __06__ = __05__ & LOWER_MASK;
            __07__ = mt + kk | 0;
            __08__ = __07__ << 2;
            __09__ = HEAPI32[__08__ >> 2] | 0;
            __10__ = __09__ & UPPER_MASK;
            y = __10__ | __06__;
            __12__ = mt + kk | 0;
            __13__ = __12__ << 2 | 0;
            __14__ = y & 1 | 0;
            __15__ = mag01 + __14__ | 0;
            __16__ = __15__ << 2 | 0;
            __17__ = HEAPU32[__16__ >> 2] | 0;
            __18__ = y >> 1 | 0;
            __19__ = kk + M | 0;
            __20__ = mt + __19__ | 0;
            __21__ = __20__ << 2 | 0;
            __22__ = HEAPU32[__21__ >> 2] | 0;
            __23__ = __22__ ^ __18__ | 0;
            __24__ = __23__ ^ __17__ | 0;
            HEAPU32[__13__ >> 2] = __24__ | 0;
        }
        for (; (kk | 0 | 0) < (N - 1 | 0); kk = kk + 1 | 0) {
            __25__ = kk + 1 | 0;
            __26__ = mt + __25__ | 0;
            __27__ = __26__ << 2;
            __28__ = HEAPI32[__27__ >> 2] | 0;
            __29__ = __28__ & LOWER_MASK;
            __30__ = mt + kk | 0;
            __31__ = __30__ << 2;
            __32__ = HEAPI32[__31__ >> 2] | 0;
            __33__ = __32__ & UPPER_MASK;
            y = __33__ | __29__;
            __35__ = mt + kk | 0;
            __36__ = __35__ << 2 | 0;
            __37__ = y & 1 | 0;
            __38__ = mag01 + __37__ | 0;
            __39__ = __38__ << 2 | 0;
            __40__ = HEAPU32[__39__ >> 2] | 0;
            __41__ = y >> 1 | 0;
            __42__ = M - N | 0;
            __43__ = kk + __42__ | 0;
            __44__ = mt + __43__ | 0;
            __45__ = __44__ << 2 | 0;
            __46__ = HEAPU32[__45__ >> 2] | 0;
            __47__ = __46__ ^ __41__ | 0;
            __48__ = __47__ ^ __40__ | 0;
            HEAPU32[__36__ >> 2] = __48__ | 0;
        }
        __49__ = mt + 0 | 0;
        __50__ = __49__ << 2;
        __51__ = HEAPI32[__50__ >> 2] | 0;
        __52__ = __51__ & LOWER_MASK;
        __53__ = N - 1 | 0;
        __54__ = mt + __53__ | 0;
        __55__ = __54__ << 2;
        __56__ = HEAPI32[__55__ >> 2] | 0;
        __57__ = __56__ & UPPER_MASK;
        y = __57__ | __52__;
        __59__ = N - 1 | 0;
        __60__ = mt + __59__ | 0;
        __61__ = __60__ << 2 | 0;
        __62__ = y & 1 | 0;
        __63__ = mag01 + __62__ | 0;
        __64__ = __63__ << 2 | 0;
        __65__ = HEAPU32[__64__ >> 2] | 0;
        __66__ = y >> 1 | 0;
        __67__ = M - 1 | 0;
        __68__ = mt + __67__ | 0;
        __69__ = __68__ << 2 | 0;
        __70__ = HEAPU32[__69__ >> 2] | 0;
        __71__ = __70__ ^ __66__ | 0;
        __72__ = __71__ ^ __65__ | 0;
        HEAPU32[__61__ >> 2] = __72__ | 0;
        mti = 0;
    }
    __73__ = mt + mti | 0;
    __74__ = __73__ << 2;
    y = HEAPI32[__74__ >> 2] | 0;
    mti = mti + 1 | 0;
    __77__ = y >> 11;
    y = y ^ __77__;
    __79__ = y << 7;
    __80__ = __79__ & 2636928640;
    y = y ^ __80__;
    __82__ = y << 15;
    __83__ = __82__ & 4022730752;
    y = y ^ __83__;
    __85__ = y >> 18;
    y = y ^ __85__;
    return y | 0;
}
function test(n, m) {
    n = n | 0;
    m = m | 0;
    var __00__ = 0;
    var i = 0;
    var j = 0;
    var z = 0;
    for (i = 0 | 0; (i | 0 | 0) < (n | 0 | 0); i = i + 1 | 0) {
        for (j = 0 | 0; (j | 0 | 0) < (m | 0 | 0); j = j + 1 | 0) {
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
