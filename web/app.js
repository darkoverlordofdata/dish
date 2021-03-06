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
                Ffi.EntityIsAlreadyReleasedException = function (entity) {
                    throw new Error("EntityIsAlreadyReleasedException - " + entity);
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
System.register("mt", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, ffi_2, stdlib_1;
    var MersenneTwister;
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
            exports_3("MersenneTwister", MersenneTwister = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var HEAPU32 = new stdlib.Uint32Array(heap);
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
                    var t0 = 0;
                    var t1 = 0;
                    var t2 = 0.0;
                    var t3 = 0.0;
                    mt = malloc(N << 2) | 0;
                    mag01 = malloc(2 << 2) | 0;
                    HEAPI32[mag01 + (0 << 2) >> 2] = 0 | 0;
                    HEAPI32[mag01 + (1 << 2) >> 2] = MATRIX_A | 0;
                    HEAPU32[mt + (0 << 2) >> 2] = s & 4294967295 | 0;
                    for (mti = 1; (mti | (0 | 0)) < (N | (0 | 0)); mti = mti + 1 | 0) {
                        t1 = HEAPU32[mt + (mti - 1 << 2) >> 2] | 0;
                        t2 = +(t1 | 0);
                        t3 = +(mti | 0);
                        t0 = ~~(+1812433253 * t2 + t3 | 0) | 0;
                        HEAPU32[mt + (mti << 2) >> 2] = t0 & 4294967295 | 0;
                    }
                    return 0;
                }
                function genrand_int32() {
                    var y = 0;
                    var kk = 0;
                    var z = 0;
                    if ((mti | (0 | 0)) >= (N | (0 | 0))) {
                        if ((mti | (0 | 0)) == (N + (1 | 0) | (0 | 0))) {
                            init_genrand(5489 | 0);
                        }
                        for (kk = 0; (kk | 0 | (0 | 0)) < (N - M | (0 | 0)); kk = kk + 1 | 0) {
                            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK;
                            HEAPU32[mt + (kk << 2) >> 2] = HEAPU32[mt + (kk + M << 2) >> 2] | 0;
                        }
                        for (; (kk | 0 | (0 | 0)) < (N - (1 | 0) | (0 | 0)); kk = kk + 1 | 0) {
                            y = mt[kk] & UPPER_MASK | mt[kk + 1] & LOWER_MASK | 0;
                            HEAPU32[mt + (kk << 2) >> 2] = HEAPU32[mt + (kk + (M - N) << 2) >> 2] | 0;
                        }
                        y = mt[N - 1] & UPPER_MASK | mt[0] & LOWER_MASK | 0;
                        HEAPU32[mt + (N - 1 << 2) >> 2] = HEAPU32[mt + (M - 1 << 2) >> 2] | 0;
                        mti = 0 | 0;
                    }
                    y = HEAPU32[mt + (mti << 2) >> 2] | 0;
                    mti = mti + 1 | 0;
                    y = y ^ y >> 11 | 0;
                    y = y ^ y << 7 & 2636928640 | 0;
                    y = y ^ y << 15 & 4022730752 | 0;
                    y = y ^ y >> 18 | 0;
                    return y | 0;
                }
                function test(n, m) {
                    n = n | 0;
                    m = m | 0;
                    var i = 0;
                    var j = 0;
                    var z = 0;
                    for (i = 0 | 0; (i | 0 | (0 | 0)) < (n | 0 | (0 | 0)); i = i + 1 | 0) {
                        for (j = 0 | 0; (j | 0 | (0 | 0)) < (m | 0 | (0 | 0)); j = j + 1 | 0) {
                            z = genrand_int32() | 0;
                        }
                    }
                }
                return {
                    genrand_int32: genrand_int32,
                    test: test,
                };
            }(stdlib_1.default, ffi_1.default, ffi_2.buffer)));
            for (var k in MersenneTwister) {
                ffi_1.default['MersenneTwister_' + k] = MersenneTwister[k];
            }
        }
    }
});
System.register("Entity", ["ffi", "stdlib"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ffi_3, ffi_4, stdlib_2;
    var Entity;
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
            exports_4("Entity", Entity = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var malloc = foreign.malloc;
                var free = foreign.free;
                var EntityIsNotEnabledException = foreign.EntityIsNotEnabledException;
                var EntityAlreadyHasComponentException = foreign.EntityAlreadyHasComponentException;
                var EntityDoesNotHaveComponentException = foreign.EntityDoesNotHaveComponentException;
                var EntityIsAlreadyReleasedException = foreign.EntityIsAlreadyReleasedException;
                function Entity(self, totalComponents) {
                    self = self | 0;
                    totalComponents = totalComponents | 0;
                    HEAPI32[self + 0 >> 2] = totalComponents;
                }
                function initialize(self, creationIndex) {
                    self = self | 0;
                    creationIndex = creationIndex | 0;
                    HEAPI32[self + 8 >> 2] = creationIndex;
                    HEAPI32[self + 12 >> 2] = true;
                }
                function onComponentAdded(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    return false;
                }
                function onComponentRemoved(self, index, previousComponent) {
                    self = self | 0;
                    index = index | 0;
                    previousComponent = previousComponent | 0;
                    return false;
                }
                function onComponentReplaced(self, index, previousComponent, component) {
                    self = self | 0;
                    index = index | 0;
                    previousComponent = previousComponent | 0;
                    component = component | 0;
                    return false;
                }
                function onEntityReleased(self) {
                    self = self | 0;
                    return false;
                }
                function release(self) {
                    self = self | 0;
                    var ignore = 0;
                    HEAPI32[self + 4 >> 2] = HEAPI32[self + 4 >> 2] - 1;
                    if (HEAPI32[self + 4 >> 2] == 1) {
                        ignore = onEntityReleased(self);
                    }
                    if (HEAPI32[self + 4 >> 2] < 1) {
                        EntityIsAlreadyReleasedException(creationIndex | 0);
                        return;
                    }
                }
                function hasComponent(self, index) {
                    self = self | 0;
                    index = index | 0;
                    return HEAPI32[self + 16 + (components << 2) >> 2];
                }
                function addComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var added = 0;
                    if (!HEAPI32[self + 12 >> 2]) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (hasComponent(self, index)) {
                        return EntityAlreadyHasComponentException(index | 0) | 0;
                    }
                    HEAPI32[self + 16 + (components << 2) >> 2] = component;
                    added = onComponentAdded(self, index, component);
                    return self;
                }
                function _replaceComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var ignore = 0;
                    var previousComponent = 0;
                    previousComponent = HEAPI32[self + 16 + (components << 2) >> 2];
                    if (previousComponent) {
                        if (previousComponent == component) {
                            ignore = onComponentReplaced(self, index, previousComponent, component);
                        }
                        else {
                            HEAPI32[self + 16 + (components << 2) >> 2] = component;
                            if (!component) {
                                ignore = onComponentRemoved(self, index, previousComponent);
                            }
                            else {
                                ignore = onComponentReplaced(self, index, previousComponent, component);
                            }
                        }
                    }
                    return self;
                }
                function removeComponent(self, index) {
                    self = self | 0;
                    index = index | 0;
                    var isEnabled = 0;
                    var hasComponent = 0;
                    var ignore = 0;
                    isEnabled = HEAPI32[self + 12 >> 2];
                    hasComponent = hasComponent(self, index);
                    if (isEnabled) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (hasComponent) {
                        return EntityDoesNotHaveComponentException(index | 0) | 0;
                    }
                    ignore = _replaceComponent(self, index, 0);
                    return self;
                }
                function replaceComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var isEnabled = 0;
                    var hasComponent = 0;
                    var ignore = 0;
                    isEnabled = HEAPI32[self + 12 >> 2];
                    hasComponent = hasComponent(self, index);
                    if (!isEnabled) {
                        return EntityIsNotEnabledException() | 0;
                    }
                    if (hasComponent) {
                        ignore = addComponent(self, index, component);
                    }
                    if (!hasComponent) {
                        ignore = _replaceComponent(self, index, component);
                    }
                    return self;
                }
                function updateComponent(self, index, component) {
                    self = self | 0;
                    index = index | 0;
                    component = component | 0;
                    var previousComponent = 0;
                    previousComponent = HEAPI32[self + 16 + (components << 2) >> 2];
                    if (previousComponent) {
                        HEAPI32[self + 16 + (components << 2) >> 2] = component;
                    }
                    return self;
                }
                function getComponent(self, index) {
                    self = self | 0;
                    index = index | 0;
                    var component = 0;
                    component = hasComponent(self, index);
                    if (!component) {
                        return EntityDoesNotHaveComponentException(index | 0) | 0;
                    }
                    return component;
                }
                function hasComponents(self, indices) {
                    self = self | 0;
                    indices = indices | 0;
                    var i = 0;
                    var index = 0;
                    var component = 0;
                    for (i = 0; i < 20; i = i + 1 | 0) {
                        index = HEAPI32[indices + (i << 2) >> 2];
                        if (index) {
                            component = HEAPI32[self + 16 + (components << 2) >> 2];
                            if (!component) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                function hasAnyComponent(self, indices) {
                    self = self | 0;
                    indices = indices | 0;
                    var i = 0;
                    var index = 0;
                    var component = 0;
                    for (i = 0; i < 20; i = i + 1 | 0) {
                        index = HEAPI32[indices + (i << 2) >> 2];
                        if (index) {
                            component = HEAPI32[self + 16 + (components << 2) >> 2];
                            if (component) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                function removeAllComponents(self) {
                    self = self | 0;
                    var i = 0;
                    var component = 0;
                    var ignore = 0;
                    for (i = 0; i < 20; i = i + 1 | 0) {
                        component = HEAPI32[self + 16 + (components << 2) >> 2];
                        if (component) {
                            ignore = _replaceComponent(self, i, 0);
                        }
                    }
                }
                function retain(self) {
                    self = self | 0;
                    var refCount = 0;
                    refCount = HEAPI32[self + 4 >> 2];
                    HEAPI32[self + 4 >> 2] = refCount + 1;
                    return self;
                }
                function destroy(self) {
                    self = self | 0;
                    removeAllComponents(self);
                    HEAPI32[self + 12 >> 2] = false;
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
                    onComponentRemoved: onComponentRemoved,
                    onComponentReplaced: onComponentReplaced,
                    onEntityReleased: onEntityReleased,
                    release: release,
                    hasComponent: hasComponent,
                    addComponent: addComponent,
                    _replaceComponent: _replaceComponent,
                    removeComponent: removeComponent,
                    replaceComponent: replaceComponent,
                    updateComponent: updateComponent,
                    getComponent: getComponent,
                    hasComponents: hasComponents,
                    hasAnyComponent: hasAnyComponent,
                    removeAllComponents: removeAllComponents,
                    retain: retain,
                    destroy: destroy,
                    ctor: ctor,
                };
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
            for (var k in Entity) {
                ffi_3.default['Entity_' + k] = Entity[k];
            }
        }
    }
});
System.register("Position", ["ffi", "stdlib"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ffi_5, ffi_6, stdlib_3;
    var Position;
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
            exports_5("Position", Position = (function (stdlib, foreign, heap) {
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
                    Position: Position,
                    getX: getX,
                    setX: setX,
                    getY: getY,
                    setY: setY,
                    ctor: ctor,
                };
            }(stdlib_3.default, ffi_5.default, ffi_6.buffer)));
            for (var k in Position) {
                ffi_5.default['Position_' + k] = Position[k];
            }
        }
    }
});
System.register("Pool", ["ffi", "stdlib"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var ffi_7, ffi_8, stdlib_4;
    var Pool;
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
            exports_6("Pool", Pool = (function (stdlib, foreign, heap) {
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
                    HEAPI32[self + 0 >> 2] = startCreationIndex;
                }
                function onEntityCreated(self, entity) {
                    self = self | 0;
                    entity = entity | 0;
                    return false;
                }
                function createEntity(self) {
                    self = self | 0;
                    var creationIndex = 0;
                    var entity = 0;
                    creationIndex = HEAPI32[self + 0 >> 2] + 1;
                    entity = new Entity(20);
                    HEAPI32[self + 0 >> 2] = creationIndex;
                    Entity_initialize(entity, creationIndex);
                    Entity_retain(entity);
                    return entity;
                }
                function ctor(startCreationIndex) {
                    startCreationIndex = startCreationIndex | 0;
                    var self = 0;
                    self = malloc(40 | 0) | 0;
                    Pool(self | 0, startCreationIndex | 0);
                    return self | 0;
                }
                return {
                    Pool: Pool,
                    onEntityCreated: onEntityCreated,
                    createEntity: createEntity,
                    ctor: ctor,
                };
            }(stdlib_4.default, ffi_7.default, ffi_8.buffer)));
            for (var k in Pool) {
                ffi_7.default['Pool_' + k] = Pool[k];
            }
        }
    }
});
// Generated by CoffeeScript 1.10.0
/*
 * Run tests
 */
Promise.all(['Entity', 'Position', 'Pool', 'mt'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var Entity, MersenneTwister, Pool, Position, ref, ref1, ref2, ref3;
    (ref = arg[0], Entity = ref.Entity), (ref1 = arg[1], Position = ref1.Position), (ref2 = arg[2], Pool = ref2.Pool), (ref3 = arg[3], MersenneTwister = ref3.MersenneTwister);
    return describe('Entitas / asm.js', function () {
        return console.log('hello');
    });
}, function (err) {
    return console.log(err);
});
