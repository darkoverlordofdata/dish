import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'

export const ecs = (function(stdlib, foreign, heap) {
    "use asm";

    var HEAP = new stdlib.Uint32Array(heap);
    var malloc = foreign.malloc;


}(Stdlib, Ffi, buffer))
