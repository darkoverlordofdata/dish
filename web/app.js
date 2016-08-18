// Generated by CoffeeScript 1.10.0
System.register("ffi", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Ffi, HEAP, HEAP_SIZE, allocator, buffer, foreign, bufferMax;
    return {
        setters:[],
        execute: function() {
            /*
            ## Foreign function interface
             */
            HEAP_SIZE = 0x40000;
            Ffi = (function () {
                function Ffi() { }
                Ffi.EntityIsNotEnabledException = function () {
                    throw new Error('EntityIsNotEnabledException');
                };
                Ffi.EntityAlreadyHasComponentException = function (index) {
                    throw new Error("EntityAlreadyHasComponentException - " + index);
                };
                Ffi.EntityDoesNotHaveComponentException = function (index) {
                    throw new Error("EntityDoesNotHaveComponentException - " + index);
                };
                Ffi.now = function () {
                    return performance.now();
                };
                /*
                 * malloc
                 *
                 * @param nBytes number of bytes required
                 * @returns starting offset in the heap
                 */
                Ffi.malloc = function (nBytes) {
                    var offset;
                    if (typeof malloc !== "undefined" && malloc !== null) {
                        return allocator.alloc(nBytes);
                    }
                    else {
                        /*
                        * Fallback:
                        * this is a naive implementation of malloc.
                        * memory is only allocated, never freed.
                         */
                        offset = HEAP[0];
                        HEAP[0] = offset + nBytes;
                        return offset;
                    }
                };
                Ffi.free = function (addr) {
                    if (typeof malloc !== "undefined" && malloc !== null) {
                        return allocator.free(addr);
                    }
                };
                return Ffi;
            })();
            exports_1("default",Ffi);
            exports_1("buffer", buffer = new ArrayBuffer(HEAP_SIZE));
            exports_1("foreign", foreign = Ffi);
            exports_1("bufferMax", bufferMax = HEAP_SIZE);
            if (typeof malloc !== "undefined" && malloc !== null) {
                allocator = new malloc.Allocator(buffer);
            }
            else {
                HEAP = new Int32Array(buffer);
                HEAP[0] = 16;
            }
        }
    }
});
// Generated by CoffeeScript 1.10.0
System.register("stdlib", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Stdlib;
    return {
        setters:[],
        execute: function() {
            /*
            ## Stdlib
             */
            Stdlib = (function () {
                function Stdlib() { }
                Stdlib.Math = Math;
                Stdlib.Int8Array = Int8Array;
                Stdlib.Int16Array = Int16Array;
                Stdlib.Int32Array = Int32Array;
                Stdlib.Uint8Array = Uint8Array;
                Stdlib.Uint16Array = Uint16Array;
                Stdlib.Uint32Array = Uint32Array;
                Stdlib.Float32Array = Float32Array;
                Stdlib.Float64Array = Float64Array;
                Stdlib.NaN = NaN;
                Stdlib.Infinity = Infinity;
                return Stdlib;
            })();
            exports_2("default",Stdlib);
        }
    }
});
System.register("Entity", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, ffi_2, stdlib_1;
    var Entity;
    return {
        setters:[
            function (ffi_1_1) {
                ffi_1 = ffi_1_1;
                ffi_2 = ffi_1_1;
            },
            function (stdlib_1_1) {
                stdlib_1 = stdlib_1_1;
            }],
        execute: function() {
            exports_3("Entity", Entity = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var malloc = foreign.malloc;
                var free = foreign.free;
                var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
                var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
                var EntityDoesNotHaveComponentException = foreign.EntityDoesNotHaveComponentException;
                function Entity(self, totalComponents) {
                    self = self | 0;
                    totalComponents = totalComponents | 0;
                    HEAPI32[self + 0 >> 2] = totalComponents | 0;
                }
                function initialize(self, creationIndex) {
                    self = self | 0;
                    creationIndex = creationIndex | 0;
                    HEAPI32[self + 8 >> 2] = creationIndex | 0;
                    HEAPI32[self + 12 >> 2] = 1 | 0;
                }
                function onComponentAdded(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    return 0 | 0;
                }
                function addComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var added = 0;
                    var isEnabled = 0;
                    var hasComponent = 0;
                    isEnabled = HEAPI32[self + 12 >> 2] | 0;
                    hasComponent = hasComponent(self | 0, index | 0) | 0;
                    if (!isEnabled) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (hasComponent) {
                        return EntityAlreadyHasComponentException(index | 0) | 0;
                    }
                    HEAPI32[self + 16 + (index << 2) >> 2] = component | 0;
                    added = onComponentAdded(self | 0, index | 0, component | 0) | 0;
                    return self | 0;
                }
                function removeComponent(self, index) {
                    self = self | 0;
                    index = index | 0;
                    var isEnabled = 0;
                    var hasComponent = 0;
                    isEnabled = HEAPI32[self + 12 >> 2] | 0;
                    hasComponent = hasComponent(self | 0, index | 0) | 0;
                    if (!isEnabled) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (!hasComponent) {
                        return EntityDoesNotHaveComponentException(index | 0) | 0;
                    }
                    _replaceComponent(self | 0, index | 0, 0 | 0) | 0;
                    return self | 0;
                }
                function replaceComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var isEnabled = 0;
                    var hasComponent = 0;
                    isEnabled = HEAPI32[self + 12 >> 2] | 0;
                    hasComponent = hasComponent(self | 0, index | 0) | 0;
                    if (!isEnabled) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (!hasComponent) {
                        _replaceComponent(self | 0, index | 0, component | 0) | 0;
                    }
                    else {
                        addComponent(self | 0, index | 0, component | 0) | 0;
                    }
                    return self | 0;
                }
                function updateComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var previousComponent = 0;
                    previousComponent = HEAPI32[self + 16 + (index << 2) >> 2] | 0;
                    if (previousComponent != 0) {
                        HEAPI32[self + 16 + (index << 2) >> 2] = component | 0;
                    }
                    return self | 0;
                }
                function _replaceComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    return self | 0;
                }
                function hasComponent(self, index) {
                    self = self | 0;
                    index = index | 0;
                    return HEAPI32[self + 16 + (index << 2) >> 2] | 0;
                }
                function ctor(totalComponents) {
                    totalComponents = totalComponents | 0;
                    var self = 0;
                    self = malloc(96 | 0) | 0;
                    Entity(self | 0, totalComponents | 0);
                    return self | 0;
                }
                return {
                    Entity: Entity,
                    initialize: initialize,
                    onComponentAdded: onComponentAdded,
                    addComponent: addComponent,
                    removeComponent: removeComponent,
                    replaceComponent: replaceComponent,
                    updateComponent: updateComponent,
                    _replaceComponent: _replaceComponent,
                    hasComponent: hasComponent,
                    ctor: ctor,
                };
            }(stdlib_1.default, ffi_1.default, ffi_2.buffer)));
            for (var k in Entity) {
                ffi_1.default['Entity_' + k] = Entity[k];
            }
        }
    }
});
System.register("Position", ["ffi", "stdlib"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ffi_3, ffi_4, stdlib_2;
    var Position;
    return {
        setters:[
            function (ffi_3_1) {
                ffi_3 = ffi_3_1;
                ffi_4 = ffi_3_1;
            },
            function (stdlib_2_1) {
                stdlib_2 = stdlib_2_1;
            }],
        execute: function() {
            exports_4("Position", Position = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPF64 = new stdlib.Float64Array(heap);
                var malloc = foreign.malloc;
                var free = foreign.free;
                function Position(self, x, y) {
                    self = self | 0;
                    x = +x;
                    y = +y;
                    HEAPF64[self + 0 >> 3] = +x;
                    HEAPF64[self + 8 >> 3] = +y;
                }
                function getX(self) {
                    self = self | 0;
                    var z = 0.0;
                    z = +HEAPF64[self + 0 >> 3];
                    return +HEAPF64[self + 0 >> 3];
                }
                function setX(self, x) {
                    self = self | 0;
                    x = +x;
                    HEAPF64[self + 0 >> 3] = +x;
                }
                function getY(self) {
                    self = self | 0;
                    return +HEAPF64[self + 8 >> 3];
                }
                function setY(self, y) {
                    self = self | 0;
                    y = +y;
                    HEAPF64[self + 8 >> 3] = +y;
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
                    Position: Position,
                    getX: getX,
                    setX: setX,
                    getY: getY,
                    setY: setY,
                    ctor: ctor,
                };
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
            for (var k in Position) {
                ffi_3.default['Position_' + k] = Position[k];
            }
        }
    }
});
System.register("pool", ["ffi", "stdlib"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ffi_5, ffi_6, stdlib_3;
    var pool;
    return {
        setters:[
            function (ffi_5_1) {
                ffi_5 = ffi_5_1;
                ffi_6 = ffi_5_1;
            },
            function (stdlib_3_1) {
                stdlib_3 = stdlib_3_1;
            }],
        execute: function() {
            exports_5("pool", pool = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var malloc = foreign.malloc;
                var free = foreign.free;
                var Entity_Entity = foreign.Entity_Entity;
                var Entity_ctor = foreign.Entity_ctor;
                var Entity_initialize = foreign.Entity_initialize;
                var Entity_onComponentAdded = foreign.Entity_onComponentAdded;
                var Entity_addComponent = foreign.Entity_addComponent;
                var Entity_removeComponent = foreign.Entity_removeComponent;
                var Entity_replaceComponent = foreign.Entity_replaceComponent;
                var Entity_updateComponent = foreign.Entity_updateComponent;
                var Entity__replaceComponent = foreign.Entity__replaceComponent;
                var Entity_hasComponent = foreign.Entity_hasComponent;
                var Position_Position = foreign.Position_Position;
                var Position_ctor = foreign.Position_ctor;
                var Position_getX = foreign.Position_getX;
                var Position_setX = foreign.Position_setX;
                var Position_getY = foreign.Position_getY;
                var Position_setY = foreign.Position_setY;
                var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
                var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
                var POOL_SIZE = 4096;
                var init = 1;
                var pool = 0;
                var totalComponents = 0;
                var count = 0;
                var index = 0;
                var uniqueId = 0;
                function initialize(count) {
                    count = count | 0;
                    if (init) {
                        totalComponents = count | 0;
                        uniqueId = 0 | 0;
                        pool = malloc(POOL_SIZE << 2) | 0;
                        init = 0 | 0;
                    }
                }
                function createPos(x, y) {
                    x = +x;
                    y = +y;
                    return Position_ctor(+x, +y) | 0;
                }
                function getTotalComponents() {
                    return totalComponents | 0;
                }
                function getCount() {
                    return count | 0;
                }
                function createEntity() {
                }
                function destroyEntity(entity) {
                    entity = entity | 0;
                }
                function destroyAllEntities() {
                }
                function hasEntity(entity) {
                    entity = entity | 0;
                }
                function getEntities(matching) {
                    matching = matching | 0;
                }
                function getGroup(matching) {
                    matching = matching | 0;
                }
                function updateGroupsComponentAddedOrRemoved(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                }
                function updateGroupsComponentReplaced(entity, index, prevcomponent, newcomponent) {
                    entity = entity | 0;
                    index = index | 0;
                    prevcomponent = prevcomponent | 0;
                    newcomponent = newcomponent | 0;
                }
                function onEntityReleased(entity) {
                    entity = entity | 0;
                }
                function addComponent(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                }
                function removeComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                }
                function replaceComponent(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                }
                function getComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                }
                function hasComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                }
                return {
                    initialize: initialize,
                    createPos: createPos,
                    getTotalComponents: getTotalComponents,
                    getCount: getCount,
                    createEntity: createEntity,
                    destroyEntity: destroyEntity,
                    destroyAllEntities: destroyAllEntities,
                    hasEntity: hasEntity,
                    getEntities: getEntities,
                    getGroup: getGroup,
                    updateGroupsComponentAddedOrRemoved: updateGroupsComponentAddedOrRemoved,
                    updateGroupsComponentReplaced: updateGroupsComponentReplaced,
                    onEntityReleased: onEntityReleased,
                    addComponent: addComponent,
                    removeComponent: removeComponent,
                    replaceComponent: replaceComponent,
                    getComponent: getComponent,
                    hasComponent: hasComponent,
                };
            }(stdlib_3.default, ffi_5.default, ffi_6.buffer)));
            for (var k in pool) {
                ffi_5.default['pool_' + k] = pool[k];
            }
        }
    }
});
// Generated by CoffeeScript 1.10.0
/*
 * Run tests
 */
Promise.all(['Entity', 'Position', 'pool'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var Entity, Position, pool, ref, ref1, ref2;
    (ref = arg[0], Entity = ref.Entity), (ref1 = arg[1], Position = ref1.Position), (ref2 = arg[2], pool = ref2.pool);
    return describe('Entitas / asm.js', function () {
        console.log('hello');
        return it('Create Position', function () {
            var pos;
            pool.initialize(10);
            pos = pool.createPos(95.0, 96.0);
            console.log('Pos', Position.getX(pos), ',', Position.getY(pos));
            expect(Position.getX(pos)).to.equal(95);
            return expect(Position.getY(pos)).to.equal(96);
        });
    });
}, function (err) {
    return console.log(err);
});
