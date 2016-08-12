/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const Position = (function(stdlib, foreign, heap) {
"use asm";
function Position(self, x, y) {
    self = self | 0;
    x = +x;
    y = +y;
    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0;
    __01__ = self + 0;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = x;
    __03__ = self + 2;
    __04__ = __03__ << 2;
    HEAPI32[__04__ >> 2] = y;
}    
return { 
    Position:Position, 
};
}(Stdlib, Ffi, buffer))
for (let k in Position) { 
    Ffi['Position_'+k] = Position[k] 
}
