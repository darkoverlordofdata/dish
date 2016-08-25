/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const Position = (function(stdlib, foreign, heap) {
"use asm";
var malloc = foreign.malloc;
var free = foreign.free;
function Position(self, x, y) {
    self = self | 0;
    x = +x;
    y = +y;
    HEAPF64[self + 0 >> 3] = x;
    HEAPF64[self + 8 >> 3] = y;
}
function getX(self) {
    self = self | 0;
    var z = 0;
    z = HEAPF64[self + 0 >> 3];
    return HEAPF64[self + 0 >> 3];
}
function setX(self, x) {
    self = self | 0;
    x = +x;
    HEAPF64[self + 0 >> 3] = x;
}
function getY(self) {
    self = self | 0;
    return HEAPF64[self + 8 >> 3];
}
function setY(self, y) {
    self = self | 0;
    y = +y;
    HEAPF64[self + 8 >> 3] = y;
}
function ctor(x, y) {
    x = +x;
    y = +y;
    var self = 0;
    self = malloc(16 | 0) | 0;
    Position(self | 0, +x, +y);
    return self | 0;
}    
return { 
    Position:Position,
    getX:getX,
    setX:setX,
    getY:getY,
    setY:setY,
    ctor:ctor, 
};
}(Stdlib, Ffi, buffer))
for (let k in Position) { 
    Ffi['Position_'+k] = Position[k] 
}
