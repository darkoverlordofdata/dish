/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const unit = (function(stdlib, foreign, heap) {
"almost asm";
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

function inc(i) {
    i = i | 0;
    var __00__ = 0;
    var k = 0;
    k = i + 1 | 0;
    return k | 0;
}

function fib(x) {
    x = x | 0;
    var __01__ = 0, __02__ = 0;
    var result = 0;
    var f1 = 0;
    var f2 = 0;
    var x1 = 0;
    var x2 = 0;
    var b = 0;
    __01__ = 2 | 0;
    __02__ = x | 0;
    b = __02__ < __01__ | 0;
    if (b | 0) {
        result = 1 | 0;
    } else {
        x1 = x - 1 | 0;
        x2 = x - 2 | 0;
        f2 = fib(x2) | 0;
        f1 = fib(x1) | 0;
        result = f1 + f2 | 0;
    }
    return result | 0;
}

function fibz(x) {
    x = x | 0;
    var __01__ = 0, __02__ = 0;
    var result = 0;
    var f1 = 0;
    var f2 = 0;
    var x1 = 0;
    var x2 = 0;
    var b = 0;
    var i = 0;
    var a = 0;
    var v1 = 0;
    var v2 = 0;
    var v3 = 0;
    var v4 = 0;
    var v5 = 0;
    __01__ = 2 | 0;
    __02__ = x | 0;
    b = __02__ < __01__ | 0;
    if (b | 0) {
        result = 1 | 0;
    } else {
        i = 1;
        a = x;
        while (1) {
            v1 = i - 1 | 0;
            v2 = fibz(v1) | 0;
            v3 = i - 2 | 0;
            v4 = v2 + a | 0;
            v5 = v3 < 2 | 0;
            if (v5) {
                result = v4;
                return result | 0;
            } else {
                a = v4;
                i = v3;
            }
        }
    }
    return result | 0;
}

return { 
    fib:fib,
    fibz:fibz,
};
}(Stdlib, Ffi, buffer))
for (let k in unit) { 
    Ffi['unit_'+k] = unit[k] 
}
