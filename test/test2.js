import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const test2 = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var malloc = foreign.malloc;
function index(i) {
    i = i | 0;
    var $01 = 0, $02 = 0;
    var value = 0;
    var k = 0;
    var result = 0;
    value = 24;
    $01 = value + i | 0;
    $02 = $01 << 2;
    result = HEAPI32[$02 >> 2] | 0;
    return result | 0;
}    
return { 
    index:index, 
};
}(Stdlib, Ffi, buffer))
