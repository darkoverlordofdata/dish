// Generated by CoffeeScript 1.10.0
System.register("stdlib", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
            exports_1("default",Stdlib);
        }
    }
});
// Generated by CoffeeScript 1.10.0
System.register("ffi", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
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
            exports_2("default",Ffi);
            exports_2("buffer", buffer = new ArrayBuffer(HEAP_SIZE));
            exports_2("foreign", foreign = Ffi);
            exports_2("bufferMax", bufferMax = HEAP_SIZE);
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
System.register("test-twister", ["ffi", "stdlib"], function(exports_3, context_3) {
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
                var HEAPI8 = new stdlib.Int8Array(heap);
                var HEAPU8 = new stdlib.Uint8Array(heap);
                var HEAPI16 = new stdlib.Int16Array(heap);
                var HEAPU16 = new stdlib.Uint16Array(heap);
                var HEAPI32 = new stdlib.Int32Array(heap);
                var HEAPU32 = new stdlib.Uint32Array(heap);
                var HEAPF32 = new stdlib.Float32Array(heap);
                var HEAPF64 = new stdlib.Float64Array(heap);
                var malloc = foreign.malloc;
                var imul = stdlib.Math.imul;
                var N = 624;
                var M = 397;
                var MATRIX_A = 2567483615;
                var UPPER_MASK = 2147483648;
                var LOWER_MASK = 2147483647;
                var mt = 0;
                var mti = 625;
                function init_genrand(s) {
                    s = s | 0;
                    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __10__ = 0, __11__ = 0, __12__ = 0, __16__ = 0, __17__ = 0, __18__ = 0, __19__ = 0, __20__ = 0;
                    var n = 0;
                    var t2 = 0;
                    var t3 = 0;
                    var t4 = 0;
                    var r1 = 0.0;
                    var r3 = 0.0;
                    r1 = +1812433253;
                    mt = (malloc(N << 2) | 0) >> 2;
                    __01__ = mt + 0 | 0;
                    __02__ = __01__ << 2 | 0;
                    __03__ = s & 4294967295 | 0;
                    HEAPU32[__02__ >> 2] = __03__ | 0;
                    for (mti = 1; mti < N; mti = mti + 1 | 0) {
                        __04__ = mti - 1 | 0;
                        __05__ = mt + __04__ | 0;
                        __06__ = __05__ << 2;
                        __07__ = HEAPI32[__06__ >> 2] | 0;
                        __08__ = __07__ >> 30;
                        __09__ = mti - 1 | 0;
                        __10__ = mt + __09__ | 0;
                        __11__ = __10__ << 2;
                        __12__ = HEAPI32[__11__ >> 2] | 0;
                        t2 = __12__ ^ __08__;
                        r3 = +(r1 * +(t2));
                        t3 = ~~(r3) + mti | 0;
                        __16__ = mt + mti | 0;
                        __17__ = __16__ << 2 | 0;
                        __18__ = t3 & 4294967295 | 0;
                        HEAPU32[__17__ >> 2] = __18__ | 0;
                        __19__ = mt + mti | 0;
                        __20__ = __19__ << 2;
                        t4 = HEAPI32[__20__ >> 2] | 0;
                        if (mti < 6) {
                            console.log('test-twister: t2 = ', t2, t3, r3, t4);
                        }
                    }
                    return 0 | 0;
                }
                function genrand_int32() {
                    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0, __06__ = 0, __07__ = 0, __08__ = 0, __09__ = 0, __11__ = 0, __12__ = 0, __13__ = 0, __14__ = 0, __15__ = 0, __16__ = 0, __17__ = 0, __18__ = 0, __19__ = 0, __20__ = 0, __21__ = 0, __22__ = 0, __23__ = 0, __24__ = 0, __25__ = 0, __26__ = 0, __27__ = 0, __28__ = 0, __29__ = 0, __30__ = 0, __31__ = 0, __32__ = 0, __34__ = 0, __35__ = 0, __36__ = 0, __37__ = 0, __38__ = 0, __39__ = 0, __40__ = 0, __41__ = 0, __42__ = 0, __43__ = 0, __44__ = 0, __45__ = 0, __46__ = 0, __47__ = 0, __48__ = 0, __49__ = 0, __50__ = 0, __51__ = 0, __52__ = 0, __53__ = 0, __54__ = 0, __55__ = 0, __56__ = 0, __58__ = 0, __59__ = 0, __60__ = 0, __61__ = 0, __62__ = 0, __63__ = 0, __64__ = 0, __65__ = 0, __66__ = 0, __67__ = 0, __68__ = 0, __69__ = 0, __70__ = 0, __71__ = 0, __72__ = 0, __73__ = 0, __76__ = 0, __78__ = 0, __79__ = 0, __81__ = 0, __82__ = 0, __84__ = 0;
                    var y = 0;
                    var mag01 = 0;
                    var kk = 0;
                    mag01 = (malloc(2 << 2) | 0) >> 2;
                    HEAPI32[(mag01 + 0) << 2 >> 2] = 0;
                    HEAPI32[(mag01 + 1) << 2 >> 2] = MATRIX_A;
                    if (mti >= N) {
                        if (mti == N + 1) {
                            init_genrand(5489);
                        }
                        for (kk = 0; (kk | 0) < N - M; kk = kk + 1 | 0) {
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
                        for (; (kk | 0) < N - 1; kk = kk + 1 | 0) {
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
                return {
                    genrand_int32: genrand_int32,
                };
            }(stdlib_1.default, ffi_1.default, ffi_2.buffer)));
        }
    }
});
System.register("mt19937", ["ffi", "stdlib"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ffi_3, ffi_4, stdlib_2;
    var mt19937;
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
            exports_4("mt19937", mt19937 = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAP = new stdlib.Uint32Array(heap);
                var malloc = foreign.malloc;
                var imul = stdlib.Math.imul;
                var N = 624;
                var M = 397;
                var MATRIX_A = 0x9908b0df; /* constant vector a */
                var UPPER_MASK = 0x80000000; /* most significant w-r bits */
                var LOWER_MASK = 0x7fffffff; /* least significant r bits */
                var mt = 0; /* ptr -> the array for the state vector  */
                var mti = 625; /* mti==N+1 means mt[N] is not initialized */
                var T = 0;
                return {
                    genrand_int32: genrand_int32,
                };
                /* initializes mt[N] with a seed */
                function init_genrand(s) {
                    s = s | 0;
                    var r1 = 0.0;
                    var r2 = 0.0;
                    var r3 = 0.0;
                    var r4 = 0.0;
                    var t2 = 0;
                    var t3 = 0;
                    var t4 = 0;
                    r1 = +1812433253;
                    mt = malloc(N << 3) | 0; // malloc(N*sizeof(int))
                    HEAP[mt + 0] = s & 0xffffffff;
                    for (mti = 1; (mti | 0) < (N | 0); mti = mti + 1 | 0) {
                        r2 = +(HEAP[mt + mti - 1] ^ (HEAP[mt + mti - 1] >> 30));
                        t2 = ~~(r2);
                        if (mti < 6)
                            console.log('t2 = ', t2);
                        r3 = r1 * r2;
                        t3 = ~~(r3);
                        HEAP[mt + mti] = (r3 + mti) | 0; //t3 + mti | 0;
                        t4 = HEAP[mt + mti];
                        // t2 = (mt[mti-1] ^ (mt[mti-1] >> 30));
                        // r3 = r1 * to!double(t2);
                        // t3 = to!int(r3)+mti;
                        // t3 = t3 & 0xffffffff;
                        // mt[mti] = t3;
                        if (mti < 6) {
                            console.log('mt19937: t2 = ', t2, t3, r3, t4);
                        }
                    }
                }
                /* generates a random number on [0,0xffffffff]-interval */
                function genrand_int32() {
                    var y = 0;
                    var mag01 = 0;
                    var kk = 0;
                    mag01 = malloc(2 << 3) | 0;
                    HEAP[mag01 + 0] = 0;
                    HEAP[mag01 + 1] = MATRIX_A;
                    if ((mti | 0) >= (N | 0)) {
                        if ((mti | 0) == (N + 1 | 0))
                            init_genrand(5489); /* a default initial seed is used */
                        //console.log('rand ', HEAP[mt+1])
                        T = 0;
                        // for (kk=0;kk<N-M;kk++) {
                        //     y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
                        //     //if (T++<5) console.log(y)
                        //     mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
                        // }
                        for (kk = 0; (kk | 0) < (N - M | 0); kk = kk + 1 | 0) {
                            y = (HEAP[mt + kk] & UPPER_MASK) | (HEAP[mt + kk + 1] & LOWER_MASK);
                            //if (T++<5) console.log('y', y, kk, HEAP[mt+kk], HEAP[mt+kk+1])
                            HEAP[mt + kk] = HEAP[mt + kk + M] ^ (y >> 1) ^ HEAP[mag01 + (y & 1)];
                        }
                        for (; (kk | 0) < (N - 1 | 0); kk = kk + 1 | 0) {
                            y = (HEAP[mt + kk] & UPPER_MASK) | (HEAP[mt + kk + 1] & LOWER_MASK);
                            HEAP[mt + kk] = HEAP[mt + kk + M - N] ^ (y >> 1) ^ HEAP[mag01 + (y & 1)];
                        }
                        y = (HEAP[mt + N - 1] & UPPER_MASK) | (HEAP[mt + 0] & LOWER_MASK);
                        HEAP[mt + N - 1] = HEAP[mt + M - 1] ^ (y >> 1) ^ HEAP[mag01 + (y & 1)];
                        mti = 0;
                    }
                    y = HEAP[mt + mti] | 0;
                    mti = mti + 1 | 0;
                    /* Tempering */
                    y = y ^ (y >> 11);
                    y = y ^ (y << 7) & 0x9d2c5680;
                    y = y ^ (y << 15) & 0xefc60000;
                    y = y ^ (y >> 18);
                    return y | 0;
                }
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
        }
    }
});
System.register("test1", ["ffi", "stdlib"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ffi_5, ffi_6, stdlib_3;
    var test1;
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
            exports_5("test1", test1 = (function (stdlib, foreign, heap) {
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
                var buf = 0;
                function factorial(n) {
                    n = n | 0;
                    var __00__ = 0;
                    var i = 0;
                    var result = 0;
                    result = 0;
                    for (i = 0; (i | 0) < (n | 0); i = i + 1 | 0) {
                        result = result + i | 0;
                    }
                    return result | 0;
                }
                function alloc(n) {
                    n = n | 0;
                    var __00__ = 0;
                    buf = (malloc(n << 2) | 0) >> 2;
                    return buf | 0;
                }
                function values(i) {
                    i = i | 0;
                    var __01__ = 0, __02__ = 0;
                    var value = 0;
                    var k = 0;
                    var result = 0;
                    value = (malloc(10 << 2) | 0) >> 2;
                    HEAPI32[(value + 0) << 2 >> 2] = 42;
                    HEAPI32[(value + 1) << 2 >> 2] = 43;
                    HEAPI32[(value + 2) << 2 >> 2] = 44;
                    HEAPI32[(value + 3) << 2 >> 2] = 45;
                    HEAPI32[(value + 4) << 2 >> 2] = 46;
                    HEAPI32[(value + 5) << 2 >> 2] = 47;
                    HEAPI32[(value + 6) << 2 >> 2] = 48;
                    HEAPI32[(value + 7) << 2 >> 2] = 49;
                    HEAPI32[(value + 8) << 2 >> 2] = 50;
                    HEAPI32[(value + 9) << 2 >> 2] = 51;
                    __01__ = value + i | 0;
                    __02__ = __01__ << 2;
                    result = HEAPI32[__02__ >> 2] | 0;
                    return value | 0;
                }
                return {
                    factorial: factorial,
                    alloc: alloc,
                    values: values,
                };
            }(stdlib_3.default, ffi_5.default, ffi_6.buffer)));
        }
    }
});
System.register("test2", ["ffi", "stdlib"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var ffi_7, ffi_8, stdlib_4;
    var test2;
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
            exports_6("test2", test2 = (function (stdlib, foreign, heap) {
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
                var ID = 0;
                function index(ptr, i) {
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
                function and(s) {
                    s = s | 0;
                    var __01__ = 0, __02__ = 0, __03__ = 0, __04__ = 0, __05__ = 0;
                    var m = 0;
                    var x = 0;
                    m = (malloc(10 << 2) | 0) >> 2;
                    __01__ = m + 0 | 0;
                    __02__ = __01__ << 2;
                    __03__ = s & 4294967295;
                    HEAPI32[__02__ >> 2] = __03__ | 0;
                    __04__ = m + 0 | 0;
                    __05__ = __04__ << 2;
                    x = HEAPI32[__05__ >> 2] | 0;
                    return x | 0;
                }
                function test() {
                    var __00__ = 0;
                    var zz = 0;
                    zz = ~~(20);
                    return zz | 0;
                }
                return {
                    index: index,
                    and: and,
                    test: test,
                };
            }(stdlib_4.default, ffi_7.default, ffi_8.buffer)));
        }
    }
});
// Generated by CoffeeScript 1.10.0
/*
 * Run tests
 *
 */
Promise.all(['test1', 'test2', 'test-twister', 'mt19937'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var MersenneTwister, mt19937, ref, ref1, ref2, ref3, test1, test2;
    (ref = arg[0], test1 = ref.test1), (ref1 = arg[1], test2 = ref1.test2), (ref2 = arg[2], MersenneTwister = ref2.MersenneTwister), (ref3 = arg[3], mt19937 = ref3.mt19937);
    return describe('Basic Tests', function () {
        it('Factorial', function () {
            expect(test1.factorial(10)).to.equal(45);
        });
        it('Alloc', function () {
            expect(test1.alloc(10)).to.equal(typeof malloc !== "undefined" && malloc !== null ? 68 : 4);
            expect(test1.alloc(10)).to.equal(typeof malloc !== "undefined" && malloc !== null ? 80 : 14);
        });
        it('List', function () {
            expect(test1.values()).to.equal(typeof malloc !== "undefined" && malloc !== null ? 92 : 24);
            expect(test2.index((typeof malloc !== "undefined" && malloc !== null ? 92 : 24), 2)).to.equal(44);
        });
        it('Random', function () {
            expect(mt19937.genrand_int32()).to.equal(testResults[0]);
            expect(mt19937.genrand_int32()).to.equal(testResults[1]);
            expect(mt19937.genrand_int32()).to.equal(testResults[2]);
            expect(mt19937.genrand_int32()).to.equal(testResults[3]);
            expect(mt19937.genrand_int32()).to.equal(testResults[4]);
        });
        it('And', function () {
            return expect(test2.and(42)).to.equal(42);
        });
        return it('MersenneTwister', function () {
            return expect(MersenneTwister.genrand_int32()).to.equal(testResults[0]);
        });
    });
}, function (err) {
    return console.log(err);
});
