/** generated by dish 0.0.1 */
import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'
export const Pool = (function(stdlib, foreign, heap) {
"use asm";
var HEAPI32 = new stdlib.Int32Array(heap);
var malloc = foreign.malloc;
var free = foreign.free;
var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
var Entity_Entity = foreign.Entity_Entity;
var Entity_ctor = foreign.Entity_ctor;
var Entity_initialize = foreign.Entity_initialize;
var Entity_onComponentAdded = foreign.Entity_onComponentAdded;
var Entity_onComponentRemoved = foreign.Entity_onComponentRemoved;
var Entity_onComponentReplaced = foreign.Entity_onComponentReplaced;
var Entity_onEntityReleased = foreign.Entity_onEntityReleased;
var Entity_release = foreign.Entity_release;
var Entity_hasComponent = foreign.Entity_hasComponent;
var Entity_addComponent = foreign.Entity_addComponent;
var Entity__replaceComponent = foreign.Entity__replaceComponent;
var Entity_removeComponent = foreign.Entity_removeComponent;
var Entity_replaceComponent = foreign.Entity_replaceComponent;
var Entity_updateComponent = foreign.Entity_updateComponent;
var Entity_getComponent = foreign.Entity_getComponent;
var Entity_hasComponents = foreign.Entity_hasComponents;
var Entity_hasAnyComponent = foreign.Entity_hasAnyComponent;
var Entity_removeAllComponents = foreign.Entity_removeAllComponents;
var Entity_retain = foreign.Entity_retain;
var Entity_destroy = foreign.Entity_destroy;
function Pool(self, startCreationIndex) {
    self = self | 0;
    startCreationIndex = startCreationIndex | 0;
    HEAPI32[self + 0 >> 2] = startCreationIndex | 0;
}
function onEntityCreated(self, entity) {
    self = self | 0;
    entity = entity | 0;
    return 0 | 0;
}
function createEntity(self) {
    self = self | 0;
    var creationIndex = 0;
    var entity = 0;
    creationIndex = HEAPI32[self + 0 >> 2] | 0;
    entity = Entity_ctor(20 | 0) | 0;
    HEAPI32[self + 0 >> 2] = creationIndex | 0;
    Entity_initialize(entity | 0, creationIndex | 0);
    Entity_retain(entity | 0) | 0;
    return entity | 0;
}
function ctor(startCreationIndex) {
    startCreationIndex = startCreationIndex | 0;
    var self = 0;
    self = malloc(40 | 0) | 0;
    Pool(self | 0, startCreationIndex | 0);
    return self | 0;
}    
return { 
    Pool:Pool,
    onEntityCreated:onEntityCreated,
    createEntity:createEntity,
    ctor:ctor, 
};
}(Stdlib, Ffi, buffer))
for (let k in Pool) { 
    Ffi['Pool_'+k] = Pool[k] 
}
