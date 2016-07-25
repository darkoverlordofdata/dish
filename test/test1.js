import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const test1 = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var malloc = foreign.malloc;
var buf = 0;
function factorial(n) {
    n = n | 0;
    var $00 = 0;
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
    var $00 = 0;
    buf = (malloc(n << 2) | 0) >> 2;
    return buf | 0;
}
function index(i) {
    i = i | 0;
    var $01 = 0, $02 = 0;
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
    $01 = value + i | 0;
    $02 = $01 << 2;
    result = HEAPI32[$02 >> 2] | 0;
    return result | 0;
}    
return { 
    factorial:factorial,
    alloc:alloc,
    index:index, 
};
}(Stdlib, Ffi, buffer))
