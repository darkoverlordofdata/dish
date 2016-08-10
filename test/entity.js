/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const Entity = (function(stdlib, foreign, heap) {
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
var ID = 0;
var ENABLED = 1;
var COUNT = 2;
var COMPONENT = 3;
var MAX = 20;
function ctor(totalComponents) {
    totalComponents = totalComponents | 0;
    var __01__ = 0, __02__ = 0, __03__ = 0;
    var e = 0;
    var entitySize = 0;
    __01__ = MAX * 4 | 0;
    __02__ = __01__ + 4 | 0;
    __03__ = __02__ + 4 | 0;
    entitySize = __03__ + 4 | 0;
    e = (malloc(entitySize << 2) | 0) >> 2;
    Entity(e, totalComponents);
    return e | 0;
}
function Entity(self, totalComponents) {
    self = self | 0;
    totalComponents = totalComponents | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = self + COUNT;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = totalComponents;
}
function getId(self) {
    self = self | 0;
    var __01__ = 0, __02__ = 0;
    var id = 0;
    __01__ = self + 0 | 0;
    __02__ = __01__ << 2;
    id = HEAPI32[__02__ >> 2] | 0;
    return id | 0;
}
function setId(self, id) {
    self = self | 0;
    id = id | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = self + 0;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = id;
}
function getEnabled(self) {
    self = self | 0;
    var __01__ = 0, __02__ = 0;
    var enabled = 0;
    __01__ = self + ENABLED | 0;
    __02__ = __01__ << 2;
    enabled = HEAPI32[__02__ >> 2] | 0;
    return enabled | 0;
}
function setEnabled(self, enabled) {
    self = self | 0;
    enabled = enabled | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = self + ENABLED;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = enabled;
}
function getComponent(self, index) {
    self = self | 0;
    index = index | 0;
    var __01__ = 0, __02__ = 0, __03__ = 0;
    var component = 0;
    __01__ = index + COMPONENT | 0;
    __02__ = self + __01__ | 0;
    __03__ = __02__ << 2;
    component = HEAPI32[__03__ >> 2] | 0;
    return component | 0;
}
function setComponent(self, index, value) {
    self = self | 0;
    index = index | 0;
    value = value | 0;
    var __01__ = 0, __02__ = 0, __03__ = 0;
    __01__ = index + COMPONENT;
    __02__ = self + __01__;
    __03__ = __02__ << 2;
    HEAPI32[__03__ >> 2] = value;
}    
return { 
    ctor:ctor,
    Entity:Entity,
    getId:getId,
    setId:setId,
    getEnabled:getEnabled,
    setEnabled:setEnabled,
    getComponent:getComponent,
    setComponent:setComponent, 
};
}(Stdlib, Ffi, buffer))
for (let k in Entity) { 
    Ffi['Entity_'+k] = Entity[k] 
}
