/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const test1 = (function(stdlib, foreign, heap) {
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
var buf = 0;
function factorial(n) {
    n = n | 0;
    var i = 0;
    var result = 0;
    result = 0;
    for (i = 0; (i | 0) < (n | 0); i = i + 1 | 0) {
        result = result + i | 0;
    }
    return result | 0;
}
function alloc(n) {
    n = n | 0;
    buf = (malloc(n << 2) | 0) >> 2;
    return buf | 0;
}
function values(i) {
    i = i | 0;
    var __01__ = 0, __02__ = 0;
    var value = 0;
    var k = 0;
    var result = 0;
    value = (malloc(10 << 2) | 0) >> 2;
    HEAPI32[(value+0)<<2>>2] = 42;
    HEAPI32[(value+1)<<2>>2] = 43;
    HEAPI32[(value+2)<<2>>2] = 44;
    HEAPI32[(value+3)<<2>>2] = 45;
    HEAPI32[(value+4)<<2>>2] = 46;
    HEAPI32[(value+5)<<2>>2] = 47;
    HEAPI32[(value+6)<<2>>2] = 48;
    HEAPI32[(value+7)<<2>>2] = 49;
    HEAPI32[(value+8)<<2>>2] = 50;
    HEAPI32[(value+9)<<2>>2] = 51;
    __01__ = value + i | 0;
    __02__ = __01__ << 2;
    result = HEAPI32[__02__ >> 2] | 0;
    return value | 0;
}
function setEntityId(entity, id) {
    entity = entity | 0;
    id = id | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = entity + 0 | 0;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = id | 0;
    return entity | 0;
}
function createEntity() {
    var entity = 0;
    entity = (malloc(20 << 2) | 0) >> 2;
    entity = setEntityId(entity, 42) | 0;
    return entity | 0;
}
function createEntity2() {
    var entity = 0;
    entity = createEntity() | 0;
    return entity | 0;
}    
return { 
    factorial:factorial,
    alloc:alloc,
    values:values,
    createEntity:createEntity,
    createEntity2:createEntity2, 
};
}(Stdlib, Ffi, buffer))
for (let k in test1) { 
    Ffi['test1_'+k] = test1[k] 
}
