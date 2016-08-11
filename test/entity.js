/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const Entity = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var malloc = foreign.malloc;
var free = foreign.free;
function Entity(self, totalComponents) {
    self = self | 0;
    totalComponents = totalComponents | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = self + 2;
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
    __01__ = self + 1 | 0;
    __02__ = __01__ << 2;
    enabled = HEAPI32[__02__ >> 2] | 0;
    return enabled | 0;
}
function setEnabled(self, enabled) {
    self = self | 0;
    enabled = enabled | 0;
    var __01__ = 0, __02__ = 0;
    __01__ = self + 1;
    __02__ = __01__ << 2;
    HEAPI32[__02__ >> 2] = enabled;
}
function getComponent(self, index) {
    self = self | 0;
    index = index | 0;
    var __01__ = 0, __02__ = 0, __03__ = 0;
    var component = 0;
    __01__ = index + 3 | 0;
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
    __01__ = index + 3;
    __02__ = self + __01__;
    __03__ = __02__ << 2;
    HEAPI32[__03__ >> 2] = value;
}    
return { 
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
