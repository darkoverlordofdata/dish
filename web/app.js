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
System.register("entity", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, ffi_2, stdlib_1;
    var entity;
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
            exports_3("entity", entity = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI8 = new stdlib.Int8Array(heap);
                var HEAPU8 = new stdlib.Uint8Array(heap);
                var HEAPI16 = new stdlib.Int16Array(heap);
                var HEAPU16 = new stdlib.Uint16Array(heap);
                var HEAPI32 = new stdlib.Int32Array(heap);
                var HEAPU32 = new stdlib.Uint32Array(heap);
                var HEAPF32 = new stdlib.Float32Array(heap);
                var HEAPF64 = new stdlib.Float64Array(heap);
                function getId(entity) {
                    entity = entity | 0;
                    var __01__ = 0, __02__ = 0;
                    var id = 0;
                    __01__ = entity + 0 | 0;
                    __02__ = __01__ << 2;
                    id = HEAPI32[__02__ >> 2] | 0;
                    return id | 0;
                }
                function setId(entity, id) {
                    entity = entity | 0;
                    id = id | 0;
                    var __01__ = 0, __02__ = 0;
                    __01__ = entity + 0 | 0;
                    __02__ = __01__ << 2;
                    HEAPI32[__02__ >> 2] = id | 0;
                }
                function getEnabled(entity) {
                    entity = entity | 0;
                    var __01__ = 0, __02__ = 0;
                    var enabled = 0;
                    __01__ = entity + 1 | 0;
                    __02__ = __01__ << 2;
                    enabled = HEAPI32[__02__ >> 2] | 0;
                    return enabled | 0;
                }
                function setEnabled(entity, enabled) {
                    entity = entity | 0;
                    enabled = enabled | 0;
                    var __01__ = 0, __02__ = 0;
                    __01__ = entity + 1 | 0;
                    __02__ = __01__ << 2;
                    HEAPI32[__02__ >> 2] = enabled | 0;
                }
                function getComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                    var __01__ = 0, __02__ = 0, __03__ = 0;
                    var component = 0;
                    __01__ = 2 + index | 0;
                    __02__ = entity + __01__ | 0;
                    __03__ = __02__ << 2;
                    component = HEAPI32[__03__ >> 2] | 0;
                    return component | 0;
                }
                function setComponent(entity, index, value) {
                    entity = entity | 0;
                    index = index | 0;
                    value = value | 0;
                    var __01__ = 0, __02__ = 0, __03__ = 0;
                    __01__ = 2 + index | 0;
                    __02__ = entity + __01__ | 0;
                    __03__ = __02__ << 2;
                    HEAPI32[__03__ >> 2] = value | 0;
                }
                return {
                    getId: getId,
                    setId: setId,
                    getEnabled: getEnabled,
                    setEnabled: setEnabled,
                    getComponent: getComponent,
                    setComponent: setComponent,
                };
            }(stdlib_1.default, ffi_1.default, ffi_2.buffer)));
            for (var k in entity) {
                ffi_1.default['entity_' + k] = entity[k];
            }
        }
    }
});
System.register("pool", ["ffi", "stdlib"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ffi_3, ffi_4, stdlib_2;
    var pool;
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
            exports_4("pool", pool = (function (stdlib, foreign, heap) {
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
                var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
                var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
                var entity_getId = foreign.entity_getId;
                var entity_setId = foreign.entity_setId;
                var entity_getEnabled = foreign.entity_getEnabled;
                var entity_setEnabled = foreign.entity_setEnabled;
                var entity_getComponent = foreign.entity_getComponent;
                var entity_setComponent = foreign.entity_setComponent;
                var POOL_SIZE = 4096;
                var init = 1;
                var pool = 0;
                var totalComponents = 0;
                var count = 0;
                var index = 0;
                var entitySize = 0;
                var uniqueId = 0;
                function test(ptr, i) {
                    ptr = ptr | 0;
                    i = i | 0;
                    var __01__ = 0, __02__ = 0;
                    var x = 0.0;
                    var value = 0;
                    var k = 0;
                    var result = 0;
                    value = ptr;
                    __01__ = value + i | 0;
                    __02__ = __01__ << 2;
                    result = HEAPI32[__02__ >> 2] | 0;
                    return result | 0;
                }
                function initialize(count) {
                    count = count | 0;
                    var __01__ = 0, __02__ = 0;
                    if (init) {
                        totalComponents = count;
                        __01__ = 4 * 4 | 0;
                        __02__ = count * 4 | 0;
                        entitySize = __02__ + __01__ | 0;
                        uniqueId = 0;
                        pool = (malloc(POOL_SIZE << 2) | 0) >> 2;
                        init = 0;
                    }
                }
                function getTotalComponents() {
                    var __00__ = 0;
                    return totalComponents | 0;
                }
                function getCount() {
                    var __00__ = 0;
                    return count | 0;
                }
                function createEntity() {
                    var __01__ = 0, __02__ = 0;
                    var entity = 0;
                    var i = 0;
                    entity = (malloc(entitySize << 2) | 0) >> 2;
                    __01__ = entity + 0 | 0;
                    __02__ = __01__ << 2;
                    HEAPI32[__02__ >> 2] = 42 | 0;
                    uniqueId = uniqueId + 1 | 0;
                    entity_setId(entity | 0, uniqueId | 0);
                    return entity | 0;
                }
                function destroyEntity(entity) {
                    entity = entity | 0;
                    var __00__ = 0;
                }
                function destroyAllEntities() {
                    var __00__ = 0;
                }
                function hasEntity(entity) {
                    entity = entity | 0;
                    var __00__ = 0;
                }
                function getEntities(matching) {
                    matching = matching | 0;
                    var __00__ = 0;
                }
                function getGroup(matching) {
                    matching = matching | 0;
                    var __00__ = 0;
                }
                function updateGroupsComponentAddedOrRemoved(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                    var __00__ = 0;
                }
                function updateGroupsComponentReplaced(entity, index, prevcomponent, newcomponent) {
                    entity = entity | 0;
                    index = index | 0;
                    prevcomponent = prevcomponent | 0;
                    newcomponent = newcomponent | 0;
                    var __00__ = 0;
                }
                function onEntityReleased(entity) {
                    entity = entity | 0;
                    var __00__ = 0;
                }
                function addComponent(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                    var __00__ = 0;
                }
                function removeComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                    var __00__ = 0;
                }
                function replaceComponent(entity, index, component) {
                    entity = entity | 0;
                    index = index | 0;
                    component = component | 0;
                    var __00__ = 0;
                }
                function hasComponent(entity, index) {
                    entity = entity | 0;
                    index = index | 0;
                    var __00__ = 0;
                }
                return {
                    test: test,
                    initialize: initialize,
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
                    hasComponent: hasComponent,
                };
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
            for (var k in pool) {
                ffi_3.default['pool_' + k] = pool[k];
            }
        }
    }
});
// Generated by CoffeeScript 1.10.0
/*
 * Run tests
 */
Promise.all(['entity', 'pool'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var entity, pool, ref, ref1;
    (ref = arg[0], entity = ref.entity), (ref1 = arg[1], pool = ref1.pool);
    return describe('Smoke Tests', function () {
        it('Pool', function () {
            return expect(pool).to.not.equal(null);
        });
        it('Entity', function () {
            return expect(entity).to.not.equal(null);
        });
        return it('CreateEntity', function () {
            entity = pool.createEntity();
            return expect(pool.test(entity, 0)).to.equal(1);
        });
    });
}, function (err) {
    return console.log(err);
});
