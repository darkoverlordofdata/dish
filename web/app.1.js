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
            HEAP_SIZE = 0x10000;
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
                "almost asm";
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
                function create(totalComponents) {
                    totalComponents = totalComponents | 0;
                    var __01__ = 0, __02__ = 0;
                    var e = 0;
                    var entitySize = 0;
                    __01__ = totalComponents * 4 | 0;
                    __02__ = __01__ + 4 | 0;
                    entitySize = __02__ + 4 | 0;
                    e = (malloc(entitySize << 2) | 0) >> 2;
                    return e | 0;
                }
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
                    create: create,
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
                "almost asm";
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
                var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
                var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
                var entity_create = foreign.entity_create;
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
                var uniqueId = 0;
                function inc(i) {
                    i = i | 0;
                    var __00__ = 0;
                    var k = 0;
                    k = i + 1 | 0;
                    return k | 0;
                }
                function fib(x) {
                    x = x | 0;
                    var __01__ = 0, __02__ = 0;
                    var result = 0;
                    var f1 = 0;
                    var f2 = 0;
                    var x1 = 0;
                    var x2 = 0;
                    var b = 0;
                    __01__ = 2 | 0;
                    __02__ = x | 0;
                    b = __02__ < __01__ | 0;
                    if (b | 0) {
                        result = 1 | 0;
                    }
                    else {
                        x1 = x - 1 | 0;
                        x2 = x - 2 | 0;
                        f2 = fib(x2) | 0;
                        f1 = fib(x1) | 0;
                        result = f1 + f2 | 0;
                    }
                    return result | 0;
                }
                function fibz(x) {
                    x = x | 0;
                    var __01__ = 0, __02__ = 0;
                    var result = 0;
                    var f1 = 0;
                    var f2 = 0;
                    var x1 = 0;
                    var x2 = 0;
                    var b = 0;
                    var i = 0;
                    var a = 0;
                    var v1 = 0;
                    var v2 = 0;
                    var v3 = 0;
                    var v4 = 0;
                    var v5 = 0;
                    __01__ = 2 | 0;
                    __02__ = x | 0;
                    b = __02__ < __01__ | 0;
                    if (b | 0) {
                        result = 1 | 0;
                    }
                    else {
                        i = 1;
                        a = x;
                        while (1) {
                            v1 = i - 1 | 0;
                            v2 = fibz(v1) | 0;
                            v3 = i - 2 | 0;
                            v4 = v2 + a | 0;
                            v5 = v3 < 2 | 0;
                            if (v5) {
                                result = v4;
                                return result | 0;
                            }
                            else {
                                a = v4;
                                i = v3;
                            }
                        }
                    }
                    return result | 0;
                }
                function testInc() {
                    var __01__ = 0;
                    var i = 0;
                    var j = 0;
                    var k = 0;
                    i = 0;
                    while ((i | 0) < 32767) {
                        j = 0;
                        while ((j | 0) < 32767) {
                            __01__ = 32 >> 2;
                            k = j & __01__;
                            j = j + 1 | 0;
                        }
                        i = i + 1 | 0;
                    }
                    return k | 0;
                }
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
                    var __00__ = 0;
                    if (init) {
                        totalComponents = count;
                        uniqueId = 0;
                        pool = (malloc(POOL_SIZE << 2) | 0) >> 2;
                        init = 0;
                    }
                    return init | 0;
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
                    var __00__ = 0;
                    var entity = 0;
                    var i = 0;
                    entity = entity_create(totalComponents | 0) | 0;
                    uniqueId = uniqueId + 1 | 0;
                    entity_setId(entity | 0, uniqueId | 0);
                    entity_setEnabled(entity | 0, 1 | 0);
                    for (i = 0; (i | 0) < (totalComponents | 0); i = i + 1 | 0) {
                        entity_setComponent(entity | 0, i | 0, 0 | 0);
                    }
                    return entity | 0;
                }
                function destroyEntity(entity) {
                    entity = entity | 0;
                    var __00__ = 0;
                    free(entity | 0);
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
                    fib: fib,
                    fibz: fibz,
                    testInc: testInc,
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
System.register("unit", ["ffi", "stdlib"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ffi_5, ffi_6, stdlib_3;
    var unit;
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
            exports_5("unit", unit = (function (stdlib, foreign, heap) {
                "almost asm";
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
                function inc(i) {
                    i = i | 0;
                    var __00__ = 0;
                    var k = 0;
                    k = i + 1 | 0;
                    return k | 0;
                }
                function fib(x) {
                    x = x | 0;
                    var __01__ = 0, __02__ = 0;
                    var result = 0;
                    var f1 = 0;
                    var f2 = 0;
                    var x1 = 0;
                    var x2 = 0;
                    var b = 0;
                    __01__ = 2 | 0;
                    __02__ = x | 0;
                    b = __02__ < __01__ | 0;
                    if (b | 0) {
                        result = 1 | 0;
                    }
                    else {
                        x1 = x - 1 | 0;
                        x2 = x - 2 | 0;
                        f2 = fib(x2) | 0;
                        f1 = fib(x1) | 0;
                        result = f1 + f2 | 0;
                    }
                    return result | 0;
                }
                function fibz(x) {
                    x = x | 0;
                    var __01__ = 0, __02__ = 0;
                    var result = 0;
                    var f1 = 0;
                    var f2 = 0;
                    var x1 = 0;
                    var x2 = 0;
                    var b = 0;
                    var i = 0;
                    var a = 0;
                    var v1 = 0;
                    var v2 = 0;
                    var v3 = 0;
                    var v4 = 0;
                    var v5 = 0;
                    __01__ = 2 | 0;
                    __02__ = x | 0;
                    b = __02__ < __01__ | 0;
                    if (b | 0) {
                        result = 1 | 0;
                    }
                    else {
                        i = 1;
                        a = x;
                        while (1) {
                            v1 = i - 1 | 0;
                            v2 = fibz(v1) | 0;
                            v3 = i - 2 | 0;
                            v4 = v2 + a | 0;
                            v5 = v3 < 2 | 0;
                            if (v5) {
                                result = v4;
                                return result | 0;
                            }
                            else {
                                a = v4;
                                i = v3;
                            }
                        }
                    }
                    return result | 0;
                }
                return {
                    fib: fib,
                    fibz: fibz,
                };
            }(stdlib_3.default, ffi_5.default, ffi_6.buffer)));
            for (var k in unit) {
                ffi_5.default['unit_' + k] = unit[k];
            }
        }
    }
});
System.register("mt19937", ["ffi", "stdlib"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var ffi_7, ffi_8, stdlib_4;
    var mt19937;
    return {
        setters:[
            function (ffi_7_1) {
                ffi_7 = ffi_7_1;
                ffi_8 = ffi_7_1;
            },
            function (stdlib_4_1) {
                stdlib_4 = stdlib_4_1;
            }],
        execute: function() {
            /* Period parameters */
            //const mt19937 = (function() {
            exports_6("mt19937", mt19937 = (function (stdlib, foreign, heap) {
                "use asm";
                var malloc = foreign.malloc;
                var HEAP = new stdlib.Int32Array(heap);
                var N = 624;
                var M = 397;
                var MATRIX_A = 0x9908b0df; /* constant vector a */
                var UPPER_MASK = 0x80000000; /* most significant w-r bits */
                var LOWER_MASK = 0x7fffffff; /* least significant r bits */
                //var HEAP = Array(N) /* the array for the state vector  */
                var mt = 0;
                var mti = 625; //N+1; /* mti==N+1 means HEAP[mt+N] is not initialized */
                var mag01 = 0; // [0x0, MATRIX_A];
                /* initializes HEAP[mt+N] with a seed */
                function init_genrand(s) {
                    s = s | 0;
                    var t2 = 0.0;
                    var t3 = 0.0;
                    mt = malloc(N << 2) | 0;
                    mag01 = malloc(2 << 2) | 0;
                    HEAP[mag01 << 2 >> 2] = 0;
                    HEAP[(mag01 + 1) << 2 >> 2] = MATRIX_A;
                    HEAP[mt + 0 << 2 >> 2] = s & 0xffffffff;
                    for (mti = 1; (mti | 0) < (N | 0); mti = mti + 1 | 0) {
                        // HEAP[mt+mti] = 
                        // (1812433253 * (HEAP[mt+mti-1] ^ (HEAP[mt+mti-1] >> 30)) + mti); 
                        t2 = +(HEAP[mt + mti - 1 << 2 >> 2] ^ (HEAP[mt + mti - 1 << 2 >> 2] >> 30));
                        t3 = +(mti | 0);
                        HEAP[mt + mti << 2 >> 2] = ~~((1812433253.0 * t2) + t3) | 0;
                    }
                }
                /* generates a random number on [0,0xffffffff]-interval */
                function genrand_int32() {
                    var y = 0;
                    var kk = 0;
                    /* mag01[x] = x * MATRIX_A  for x=0,1 */
                    if ((mti | 0) >= (N | 0)) {
                        if ((mti | 0) == (N + 1 | 0))
                            init_genrand(5489); /* a default initial seed is used */
                        for (kk = 0; (kk | 0) < (N - M | 0); kk = kk + 1 | 0) {
                            y = (HEAP[mt + kk << 2 >> 2] & UPPER_MASK) | (HEAP[mt + kk + 1 << 2 >> 2] & LOWER_MASK);
                            HEAP[mt + kk << 2 >> 2] = HEAP[mt + kk + M << 2 >> 2] ^ (y >> 1) ^ HEAP[mag01 + (y & 0x1) << 2 >> 2];
                        }
                        for (; (kk | 0) < (N - 1 | 0); kk = kk + 1 | 0) {
                            y = (HEAP[mt + kk << 2 >> 2] & UPPER_MASK) | (HEAP[mt + kk + 1 << 2 >> 2] & LOWER_MASK);
                            HEAP[mt + kk << 2 >> 2] = HEAP[mt + kk + (M - N) << 2 >> 2] ^ (y >> 1) ^ HEAP[mag01 + (y & 0x1) << 2 >> 2];
                        }
                        y = (HEAP[mt + N - 1 << 2 >> 2] & UPPER_MASK) | (HEAP[mt + 0 << 2 >> 2] & LOWER_MASK);
                        HEAP[mt + N - 1 << 2 >> 2] = HEAP[mt + M - 1 << 2 >> 2] ^ (y >> 1) ^ HEAP[mag01 + (y & 0x1) << 2 >> 2];
                        mti = 0;
                    }
                    y = HEAP[mt + mti << 2 >> 2] | 0;
                    mti = mti + 1 | 0;
                    /* Tempering */
                    y = y ^ (y >> 11);
                    y = y ^ (y << 7) & 0x9d2c5680;
                    y = y ^ (y << 15) & 0xefc60000;
                    y = y ^ (y >> 18);
                    return y | 0;
                }
                function test(n, m) {
                    n = n | 0;
                    m = m | 0;
                    var i = 0;
                    var j = 0;
                    var z = 0;
                    for (i = 0 | 0; (i | 0) < (n | 0); i = i + 1 | 0) {
                        for (j = 0 | 0; (j | 0) < (m | 0); j = j + 1 | 0) {
                            z = genrand_int32() | 0;
                        }
                    }
                }
                return {
                    genrand_int32: genrand_int32,
                    test: test,
                };
            }(stdlib_4.default, ffi_7.default, ffi_8.buffer)));
        }
    }
});
//})();
System.register("test-twister", ["ffi", "stdlib"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var ffi_9, ffi_10, stdlib_5;
    var MersenneTwister;
    return {
        setters:[
            function (ffi_9_1) {
                ffi_9 = ffi_9_1;
                ffi_10 = ffi_9_1;
            },
            function (stdlib_5_1) {
                stdlib_5 = stdlib_5_1;
            }],
        execute: function() {
            exports_7("MersenneTwister", MersenneTwister = (function (stdlib, foreign, heap) {
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
                var N = 624;
                var M = 397;
                var MATRIX_A = 2567483615;
                var UPPER_MASK = 2147483648;
                var LOWER_MASK = 2147483647;
                var mt = 0;
                var mti = 625;
                var mag01 = 0;
                function init_genrand(s) {
                    s = s | 0;
                    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __10__ = 0, __11__ = 0, __12__ = 0, __13__ = 0, __14__ = 0, __15__ = 0, __16__ = 0, __18__ = 0, __19__ = 0, __20__ = 0;
                    var n = 0;
                    var t1 = 0;
                    var t2 = 0.0;
                    var t3 = 0.0;
                    var t0 = 0;
                    var r1 = 0.0;
                    var r3 = 0.0;
                    r1 = +1812433253;
                    mt = (malloc(N << 2) | 0) >> 2;
                    mag01 = (malloc(2 << 2) | 0) >> 2;
                    __01__ = mag01 + 0 | 0;
                    __02__ = __01__ << 2;
                    HEAPI32[__02__ >> 2] = 0 | 0;
                    __03__ = mag01 + 1 | 0;
                    __04__ = __03__ << 2;
                    HEAPI32[__04__ >> 2] = MATRIX_A | 0;
                    __05__ = mt + 0 | 0;
                    __06__ = __05__ << 2 | 0;
                    __07__ = s & 4294967295 | 0;
                    HEAPU32[__06__ >> 2] = __07__ | 0;
                    for (mti = 1; (mti | 0) < (N | 0); mti = mti + 1 | 0) {
                        __08__ = mti - 1 | 0;
                        __09__ = mt + __08__ | 0;
                        __10__ = __09__ << 2;
                        __11__ = HEAPI32[__10__ >> 2] | 0;
                        __12__ = __11__ >> 30;
                        __13__ = mti - 1 | 0;
                        __14__ = mt + __13__ | 0;
                        __15__ = __14__ << 2;
                        __16__ = HEAPI32[__15__ >> 2] | 0;
                        t1 = __16__ ^ __12__;
                        t2 = +(t1 | 0);
                        t3 = +(mti | 0);
                        t0 = ~~(r1 * t2 + t3) | 0;
                        __18__ = mt + mti | 0;
                        __19__ = __18__ << 2 | 0;
                        __20__ = t0 & 4294967295 | 0;
                        HEAPU32[__19__ >> 2] = __20__ | 0;
                    }
                    return 0 | 0;
                }
                function genrand_int32() {
                    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __11__ = 0, __12__ = 0, __13__ = 0, __14__ = 0, __15__ = 0, __16__ = 0, __17__ = 0, __18__ = 0, __19__ = 0, __20__ = 0, __21__ = 0, __22__ = 0, __23__ = 0, __24__ = 0, __25__ = 0, __26__ = 0, __27__ = 0, __28__ = 0, __29__ = 0, __30__ = 0, __31__ = 0, __32__ = 0, __34__ = 0, __35__ = 0, __36__ = 0, __37__ = 0, __38__ = 0, __39__ = 0, __40__ = 0, __41__ = 0, __42__ = 0, __43__ = 0, __44__ = 0, __45__ = 0, __46__ = 0, __47__ = 0, __48__ = 0, __49__ = 0, __50__ = 0, __51__ = 0, __52__ = 0, __53__ = 0, __54__ = 0, __55__ = 0, __56__ = 0, __58__ = 0, __59__ = 0, __60__ = 0, __61__ = 0, __62__ = 0, __63__ = 0, __64__ = 0, __65__ = 0, __66__ = 0, __67__ = 0, __68__ = 0, __69__ = 0, __70__ = 0, __71__ = 0, __72__ = 0, __73__ = 0, __76__ = 0, __78__ = 0, __79__ = 0, __81__ = 0, __82__ = 0, __84__ = 0;
                    var y = 0;
                    var kk = 0;
                    var z=0;
                    if ((mti|0) >= (N|0)) {
                        if ((mti|0) == (N + 1|0)) {
                            z=init_genrand(5489|0)|0;
                        }
                        for (kk = 0; (kk | 0) < ((N - M)|0); kk = kk + 1 | 0) {
                            __01__ = kk + 1 | 0;
                            __02__ = mt + __01__ | 0;
                            __03__ = __02__ << 2;
                            __04__ = HEAPI32[__03__ >> 2] | 0;
                            __05__ = __04__ & LOWER_MASK;
                            __06__ = mt + kk | 0;
                            __07__ = __06__ << 2;
                            __08__ = HEAPI32[__07__ >> 2] | 0;
                            __09__ = __08__ & UPPER_MASK;
                            y = __09__ | __05__;
                            __11__ = mt + kk | 0;
                            __12__ = __11__ << 2 | 0;
                            __13__ = y & 1 | 0;
                            __14__ = mag01 + __13__ | 0;
                            __15__ = __14__ << 2 | 0;
                            __16__ = HEAPU32[__15__ >> 2] | 0;
                            __17__ = y >> 1 | 0;
                            __18__ = kk + M | 0;
                            __19__ = mt + __18__ | 0;
                            __20__ = __19__ << 2 | 0;
                            __21__ = HEAPU32[__20__ >> 2] | 0;
                            __22__ = __21__ ^ __17__ | 0;
                            __23__ = __22__ ^ __16__ | 0;
                            HEAPU32[__12__ >> 2] = __23__ | 0;
                        }
                        for (; (kk | 0) < ((N - 1)|0); kk = kk + 1 | 0) {
                            __24__ = kk + 1 | 0;
                            __25__ = mt + __24__ | 0;
                            __26__ = __25__ << 2;
                            __27__ = HEAPI32[__26__ >> 2] | 0;
                            __28__ = __27__ & LOWER_MASK;
                            __29__ = mt + kk | 0;
                            __30__ = __29__ << 2;
                            __31__ = HEAPI32[__30__ >> 2] | 0;
                            __32__ = __31__ & UPPER_MASK;
                            y = __32__ | __28__;
                            __34__ = mt + kk | 0;
                            __35__ = __34__ << 2 | 0;
                            __36__ = y & 1 | 0;
                            __37__ = mag01 + __36__ | 0;
                            __38__ = __37__ << 2 | 0;
                            __39__ = HEAPU32[__38__ >> 2] | 0;
                            __40__ = y >> 1 | 0;
                            __41__ = M - N | 0;
                            __42__ = kk + __41__ | 0;
                            __43__ = mt + __42__ | 0;
                            __44__ = __43__ << 2 | 0;
                            __45__ = HEAPU32[__44__ >> 2] | 0;
                            __46__ = __45__ ^ __40__ | 0;
                            __47__ = __46__ ^ __39__ | 0;
                            HEAPU32[__35__ >> 2] = __47__ | 0;
                        }
                        __48__ = mt + 0 | 0;
                        __49__ = __48__ << 2;
                        __50__ = HEAPI32[__49__ >> 2] | 0;
                        __51__ = __50__ & LOWER_MASK;
                        __52__ = N - 1 | 0;
                        __53__ = mt + __52__ | 0;
                        __54__ = __53__ << 2;
                        __55__ = HEAPI32[__54__ >> 2] | 0;
                        __56__ = __55__ & UPPER_MASK;
                        y = __56__ | __51__;
                        __58__ = N - 1 | 0;
                        __59__ = mt + __58__ | 0;
                        __60__ = __59__ << 2 | 0;
                        __61__ = y & 1 | 0;
                        __62__ = mag01 + __61__ | 0;
                        __63__ = __62__ << 2 | 0;
                        __64__ = HEAPU32[__63__ >> 2] | 0;
                        __65__ = y >> 1 | 0;
                        __66__ = M - 1 | 0;
                        __67__ = mt + __66__ | 0;
                        __68__ = __67__ << 2 | 0;
                        __69__ = HEAPU32[__68__ >> 2] | 0;
                        __70__ = __69__ ^ __65__ | 0;
                        __71__ = __70__ ^ __64__ | 0;
                        HEAPU32[__60__ >> 2] = __71__ | 0;
                        mti = 0;
                    }
                    __72__ = mt + mti | 0;
                    __73__ = __72__ << 2;
                    y = HEAPI32[__73__ >> 2] | 0;
                    mti = mti + 1 | 0;
                    __76__ = y >> 11;
                    y = y ^ __76__;
                    __78__ = y << 7;
                    __79__ = __78__ & 2636928640;
                    y = y ^ __79__;
                    __81__ = y << 15;
                    __82__ = __81__ & 4022730752;
                    y = y ^ __82__;
                    __84__ = y >> 18;
                    y = y ^ __84__;
                    return y | 0;
                }
                function test(n, m) {
                    n = n | 0;
                    m = m | 0;
                    var __00__ = 0;
                    var i = 0;
                    var j = 0;
                    var z = 0;
                    for (i = 0 | 0; (i | 0 | 0) < (n | 0 | 0); i = i + 1 | 0) {
                        for (j = 0 | 0; (j | 0 | 0) < (m | 0 | 0); j = j + 1 | 0) {
                            z = genrand_int32() | 0;
                        }
                    }
                }
                return {
                    genrand_int32: genrand_int32,
                    test: test,
                };
            }(stdlib_5.default, ffi_9.default, ffi_10.buffer)));
            for (var k in MersenneTwister) {
                ffi_9.default['MersenneTwister_' + k] = MersenneTwister[k];
            }
        }
    }
});
// Generated by CoffeeScript 1.10.0
/*
 * Run tests
 */
Promise.all(['entity', 'pool', 'mt19937', 'test-twister'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var MersenneTwister, entity, mt19937, pool, ref, ref1, ref2, ref3;
    (ref = arg[0], entity = ref.entity), (ref1 = arg[1], pool = ref1.pool), (ref2 = arg[2], mt19937 = ref2.mt19937), (ref3 = arg[3], MersenneTwister = ref3.MersenneTwister);
    return describe('MT19937', function () {
        it('check', function () {
            expect(MersenneTwister.genrand_int32()).to.equal(20535309);
            expect(mt19937.genrand_int32()).to.equal(20535309);
            return expect(mt19937ar.genrand_int32()).to.equal(20535309);
        });
        it('time js', function () {
            var i, j, k, l, z;
            for (i = k = 0; k <= 1000; i = ++k) {
                for (j = l = 0; l <= 32767; j = ++l) {
                    z = mt19937ar.genrand_int32();
                }
            }
            return expect(0).to.equal(0);
        });
        return it('time dish', function () {
            MersenneTwister.test(1000, 32767);
            return expect(0).to.equal(0);
        });
    });
}, function (err) {
    return console.log(err);
});
