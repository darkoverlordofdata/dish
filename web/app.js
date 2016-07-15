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
    var Ffi, HEAP, buffer;
    return {
        setters:[],
        execute: function() {
            /*
            ## Foreign function interface
             */
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
                    offset = HEAP[0];
                    HEAP[0] = offset + nBytes;
                    return offset;
                };
                return Ffi;
            })();
            exports_2("default",Ffi);
            exports_2("buffer", buffer = new ArrayBuffer(0x40000));
            HEAP = new Int32Array(buffer);
            HEAP[0] = 16;
        }
    }
});
System.register("asm", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, ffi_2, stdlib_1;
    var SLOW_HEAP_SIZE, FAST_HEAP_SIZE, asm;
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
            SLOW_HEAP_SIZE = 0x10000; /* 64k Minimum heap size */
            FAST_HEAP_SIZE = 0x40000; /* 256k for performance */
            //export const buffer = new ArrayBuffer(FAST_HEAP_SIZE)
            /**
             * asm.js
             *
             * @param stdlib
             * @param usrlib
             * @param buffer
             */
            exports_3("asm", asm = (function (stdlib, usrlib, buffer) {
                "use asm";
                var exp = stdlib.Math.exp;
                var log = stdlib.Math.log;
                var fround = stdlib.Math.fround;
                var now = usrlib.now;
                var malloc = usrlib.malloc;
                var HEAP8 = new stdlib.Int8Array(buffer);
                var HEAP16 = new stdlib.Int16Array(buffer);
                var HEAP32 = new stdlib.Int32Array(buffer);
                var HEAPU8 = new stdlib.Uint8Array(buffer);
                var HEAPU16 = new stdlib.Uint16Array(buffer);
                var HEAPU32 = new stdlib.Uint32Array(buffer);
                var HEAPF32 = new stdlib.Float32Array(buffer);
                var HEAPF64 = new stdlib.Float64Array(buffer);
                var t1 = 0.0;
                function logSum(start, end) {
                    start = start | 0;
                    end = end | 0;
                    var sum = 0.0, p = 0, q = 0, i = 0, count = 0;
                    count = 1000;
                    for (i = start; (i | 0) < (count | 0); i = (i + 1) | 0) {
                        // asm.js forces byte addressing of the heap by requiring shifting by 3
                        for (p = start << 3, q = end << 3; (p | 0) < (q | 0); p = (p + 8) | 0) {
                            sum = sum + +log(HEAPF64[p >> 3]);
                        }
                    }
                    return +sum;
                }
                function geometricMean(start, end) {
                    start = start | 0;
                    end = end | 0;
                    var t1 = 0.0;
                    var t2 = 0.0;
                    var xx = 0.0;
                    xx = +logSum(1 | 0, 2 | 0);
                    t1 = +now();
                    +exp(+logSum(start, end) / +((end - start) | 0));
                    t2 = +now();
                    return +(t2 - t1);
                }
                function getTime() {
                    t1 = +geometricMean(10 | 0, 20000 | 0);
                    return +t1;
                }
                function test_malloc(n) {
                    n = n | 0;
                    var m = 0;
                    m = malloc(n | 0) | 0;
                    return m | 0;
                }
                return {
                    geometricMean: geometricMean,
                    getTime: getTime,
                    test_malloc: test_malloc
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
                var N = 624;
                var M = 397;
                var MATRIX_A = 0x9908b0df; /* constant vector a */
                var UPPER_MASK = 0x80000000; /* most significant w-r bits */
                var LOWER_MASK = 0x7fffffff; /* least significant r bits */
                var mt = 0; /* ptr -> the array for the state vector  */
                var mti = 625; /* mti==N+1 means mt[N] is not initialized */
                var T = 0;
                function peek(addr) {
                    addr = addr | 0;
                    addr = addr << 2;
                    return HEAP[addr >> 2] | 0;
                }
                function poke(addr, value) {
                    addr = addr | 0;
                    value = value | 0;
                    addr = addr << 2;
                    HEAP[addr >> 2] = value;
                }
                /* initializes mt[N] with a seed */
                function init_genrand(s) {
                    s = s | 0;
                    var t1 = 0;
                    var t2 = 0;
                    mt = malloc(N << 2) | 0; // malloc(N*sizeof(int))
                    poke(mt, s & 0xffffffff);
                    for (mti = 1; (mti | 0) < (N | 0); mti = mti + 1 | 0) {
                        t1 = peek(mt + mti - 1 | 0) | 0;
                        t2 = t1 >> 30;
                        poke(mt + mti | 0, ~~(1812433253.0 * +(t1 ^ t2) + +(mti | 0)));
                    }
                }
                /* generates a random number on [0,0xffffffff]-interval */
                function genrand_int32() {
                    var y = 0;
                    var y1 = 0;
                    var y2 = 0;
                    var mag01 = 0;
                    var kk = 0;
                    mag01 = malloc(2 << 3) | 0;
                    poke(mag01, 0);
                    poke(mag01 + 1 | 0, MATRIX_A);
                    // HEAP[mag01+0] = 0;
                    // HEAP[mag01+1] = MATRIX_A;
                    if ((mti | 0) >= (N | 0)) {
                        if ((mti | 0) == (N + 1 | 0))
                            init_genrand(5489); /* a default initial seed is used */
                        for (kk = 0; (kk | 0) < (N - M | 0); kk = kk + 1 | 0) {
                            y = ((peek(mt + kk | 0) | 0) & UPPER_MASK) | ((peek(mt + kk + 1 | 0) | 0) & LOWER_MASK);
                            poke(mt + kk | 0, (peek(mt + kk + M | 0) | 0) ^ (y >> 1) ^ (peek(mag01 + (y & 1) | 0) | 0) | 0);
                        }
                        for (; (kk | 0) < (N - 1 | 0); kk = kk + 1 | 0) {
                            y = ((peek(mt + kk | 0) | 0) & UPPER_MASK) | ((peek(mt + kk + 1 | 0) | 0) & LOWER_MASK);
                            poke(mt + kk | 0, (peek(mt + kk + M - N | 0) | 0) ^ (y >> 1) ^ (peek(mag01 + (y & 1) | 0) | 0) | 0);
                        }
                        y = ((peek(mt + N - 1 | 0) | 0) & UPPER_MASK) | ((peek(mt + 0 | 0) | 0) & LOWER_MASK);
                        // poke(mt+N-1, peek(mt+M-1) ^ (y >> 1) ^ peek(mag01+(y&1)));
                        poke(mt + N - 1 | 0, (peek(mt + M - 1 | 0) | 0) ^ (y >> 1) ^ (peek(mag01 + (y & 1) | 0) | 0) | 0);
                        mti = 0;
                    }
                    y = peek(mt + mti | 0) | 0;
                    mti = mti + 1 | 0;
                    /* Tempering */
                    y = y ^ (y >> 11);
                    y = y ^ (y << 7) & 0x9d2c5680;
                    y = y ^ (y << 15) & 0xefc60000;
                    y = y ^ (y >> 18);
                    return y | 0;
                }
                function test() {
                    var i = 0;
                    var MAX = 0;
                    var t1 = 0.0;
                    var t2 = 0.0;
                    var t = 0;
                    MAX = 10000;
                    // t1 = +now();
                    for (i = 0; (i | 0) < (MAX | 0); i = (i + 1) | 0) {
                        t = genrand_int32() | 0;
                    }
                    // t2 = +now();
                    return; // +(t2 - t1);
                }
                return {
                    genrand_int32: genrand_int32,
                    test: test
                };
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
        }
    }
});
System.register("mt19937ar", [], function(exports_5, context_5) {
    'use strict';
    var __moduleName = context_5 && context_5.id;
    var mt19937ar;
    return {
        setters:[],
        execute: function() {
            exports_5("mt19937ar", mt19937ar = (function () {
                /* Period parameters */
                var N = 624;
                var M = 397;
                var MATRIX_A = 0x9908b0df; /* constant vector a */
                var UPPER_MASK = 0x80000000; /* most significant w-r bits */
                var LOWER_MASK = 0x7fffffff; /* least significant r bits */
                var mt = Array(N); /* the array for the state vector  */
                var mti = N + 1; /* mti==N+1 means mt[N] is not initialized */
                var T = 0;
                var t2 = 0;
                return {
                    genrand_int32: genrand_int32
                };
                /* initializes mt[N] with a seed */
                function init_genrand(s) {
                    mt[0] = s & 0xffffffff;
                    for (mti = 1; mti < N; mti++) {
                        // mt[mti] = 
                        // (1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
                        t2 = (mt[mti - 1] ^ (mt[mti - 1] >> 30));
                        mt[mti] = (1812433253 * t2 + mti);
                        //if (T++<5) console.log(t2, (1812433253 * t2 + mti)&0xffffffff) ;
                        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
                        /* In the previous versions, MSBs of the seed affect   */
                        /* only MSBs of the array mt[].                        */
                        /* 2002/01/09 modified by Makoto Matsumoto             */
                        mt[mti] &= 0xffffffff;
                    }
                }
                /* generates a random number on [0,0xffffffff]-interval */
                function genrand_int32() {
                    var y;
                    var mag01 = [0x0, MATRIX_A];
                    /* mag01[x] = x * MATRIX_A  for x=0,1 */
                    if (mti >= N) {
                        var kk = void 0;
                        if (mti == N + 1)
                            init_genrand(5489); /* a default initial seed is used */
                        //console.log('rand ', mt[1])
                        T = 0;
                        for (kk = 0; kk < N - M; kk++) {
                            y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
                            //if (T++<5) console.log('y', y, kk, mt[kk], mt[kk+1])
                            mt[kk] = mt[kk + M] ^ (y >> 1) ^ mag01[y & 0x1];
                        }
                        for (; kk < N - 1; kk++) {
                            y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
                            mt[kk] = mt[kk + (M - N)] ^ (y >> 1) ^ mag01[y & 0x1];
                        }
                        y = (mt[N - 1] & UPPER_MASK) | (mt[0] & LOWER_MASK);
                        mt[N - 1] = mt[M - 1] ^ (y >> 1) ^ mag01[y & 0x1];
                        mti = 0;
                    }
                    y = mt[mti++];
                    /* Tempering */
                    y ^= (y >> 11);
                    y ^= (y << 7) & 0x9d2c5680;
                    y ^= (y << 15) & 0xefc60000;
                    y ^= (y >> 18);
                    return y;
                }
            })());
        }
    }
});
// Generated by CoffeeScript 1.10.0
Promise.all(['asm', 'mt19937ar', 'mt19937'].map(function (x) {
    return System["import"](x);
})).then(function (arg) {
    var MAX, asm, mt19937, mt19937ar, ref, ref1, ref2, testResults;
    (ref = arg[0], asm = ref.asm), (ref1 = arg[1], mt19937ar = ref1.mt19937ar), (ref2 = arg[2], mt19937 = ref2.mt19937);
    MAX = 10000;
    testResults = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    QUnit.test("asm calibration", function (assert) {
        var elapsed;
        elapsed = asm.getTime();
        return assert.ok(elapsed < 200, "elapsed < 200");
    });
    QUnit.test("malloc", function (assert) {
        var m1, m2;
        m1 = asm.test_malloc(16);
        m2 = asm.test_malloc(16);
        assert.ok(m1 !== 0, "passed " + m1);
        return assert.ok(m2 !== 0, "passed " + m2);
    });
    QUnit.test("mt19937 Same Results?", function (assert) {
        testResults[0][0] = mt19937ar.genrand_int32();
        testResults[0][1] = mt19937ar.genrand_int32();
        testResults[0][2] = mt19937ar.genrand_int32();
        testResults[0][3] = mt19937ar.genrand_int32();
        testResults[0][4] = mt19937ar.genrand_int32();
        testResults[1][0] = mt19937.genrand_int32();
        testResults[1][1] = mt19937.genrand_int32();
        testResults[1][2] = mt19937.genrand_int32();
        testResults[1][3] = mt19937.genrand_int32();
        testResults[1][4] = mt19937.genrand_int32();
        assert.ok(testResults[0][0] === testResults[1][0], "[0] Passed!");
        assert.ok(testResults[0][1] === testResults[1][1], "[1] Passed!");
        assert.ok(testResults[0][2] === testResults[1][2], "[2] Passed!");
        assert.ok(testResults[0][3] === testResults[1][3], "[3] Passed!");
        assert.ok(testResults[0][4] === testResults[1][4], "[4] Passed!");
    });
    QUnit.test("mt19937.asmjs interop " + MAX + " tries", function (assert) {
        var i, j, ref3, t1, t2;
        t1 = performance.now();
        for (i = j = 0, ref3 = MAX; 0 <= ref3 ? j <= ref3 : j >= ref3; i = 0 <= ref3 ? ++j : --j) {
            mt19937.genrand_int32();
        }
        t2 = performance.now();
        console.log("mt19937.asmjs interop " + (t2 - t1));
        assert.ok(t2 > t1, "passed");
    });
    return QUnit.test("mt19937.asmjs asm only " + MAX + " tries", function (assert) {
        var t1, t2;
        t1 = performance.now();
        mt19937.test();
        t2 = performance.now();
        console.log("mt19937.asmjs asm only " + (t2 - t1));
        assert.ok(t2 > t1, "passed");
    });
}, function (err) {
    return console.log(err);
});
