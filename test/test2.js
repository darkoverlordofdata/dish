/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const test2 = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var malloc = foreign.malloc;
function index(ptr, i) {
    ptr = ptr | 0;
    i = i | 0;
    var __01__ = 0, __02__ = 0;
    var x = 0.0;
    var value = 0;
    var k = 0;
    var result = 0;
    value = ptr;
    __01__ = value + i | 0;
    __02__ = __01__ << 2;
    result = HEAPI32[__02__ >> 2] | 0;
    return result | 0;
}
function and(s) {
    s = s | 0;
    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0;
    var m = 0;
    var x = 0;
    m = (malloc(10 << 2) | 0) >> 2;
    __01__ = m + 0 | 0;
    __02__ = __01__ << 2;
    __03__ = s & 4294967295;
    HEAPI32[__02__ >> 2] = __03__ | 0;
    __04__ = m + 0 | 0;
    __05__ = __04__ << 2;
    x = HEAPI32[__05__ >> 2] | 0;
    return x | 0;
}
function test() {
    var __00__ = 0;
    var zz = 0;
    zz = ~~(20);
    return zz | 0;
}    
return { 
    index:index,
    and:and,
    test:test, 
};
}(Stdlib, Ffi, buffer))
