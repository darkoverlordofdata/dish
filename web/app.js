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
System.register("test1", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, ffi_2, stdlib_1;
    var test1;
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
            exports_3("test1", test1 = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var malloc = foreign.malloc;
                var buf = 0;
                function factorial(n) {
                    n = n | 0;
                    var $00 = 0;
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
                    var $00 = 0;
                    buf = (malloc(n << 2) | 0) >> 2;
                    return buf | 0;
                }
                function values(i) {
                    i = i | 0;
                    var $01 = 0, $02 = 0;
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
                    $01 = value + i | 0;
                    $02 = $01 << 2;
                    result = HEAPI32[$02 >> 2] | 0;
                    return value | 0;
                }
                return {
                    factorial: factorial,
                    alloc: alloc,
                    values: values,
                };
            }(stdlib_1.default, ffi_1.default, ffi_2.buffer)));
        }
    }
});
System.register("test2", ["ffi", "stdlib"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ffi_3, ffi_4, stdlib_2;
    var test2;
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
            exports_4("test2", test2 = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
                var malloc = foreign.malloc;
                function index(ptr, i) {
                    ptr = ptr | 0;
                    i = i | 0;
                    var $01 = 0, $02 = 0;
                    var value = 0;
                    var k = 0;
                    var result = 0;
                    value = ptr;
                    $01 = value + i | 0;
                    $02 = $01 << 2;
                    result = HEAPI32[$02 >> 2] | 0;
                    return result | 0;
                }
                function and(s) {
                    s = s | 0;
                    var $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0;
                    var m = 0;
                    var x = 0;
                    m = (malloc(10 << 2) | 0) >> 2;
                    $01 = m + 0 | 0;
                    $02 = $01 << 2;
                    $03 = s & 4294967295;
                    HEAPI32[$02 >> 2] = $03 | 0;
                    $04 = m + 0 | 0;
                    $05 = $04 << 2;
                    x = HEAPI32[$05 >> 2] | 0;
                    return x | 0;
                }
                function test() {
                    var $00 = 0;
                    var zz = 0;
                    zz = ~~(20);
                    return zz | 0;
                }
                return {
                    index: index,
                    and: and,
                    test: test,
                };
            }(stdlib_2.default, ffi_3.default, ffi_4.buffer)));
        }
    }
});
System.register("mt19937", ["ffi", "stdlib"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ffi_5, ffi_6, stdlib_3;
    var mt19937;
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
            exports_5("mt19937", mt19937 = (function (stdlib, foreign, heap) {
                "use asm";
                // var HEAP = new stdlib.Float64Array(heap);
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
                /* initializes mt[N] with a seed */
                function init_genrand(s) {
                    s = s | 0;
                    var r1 = 0.0;
                    var r2 = 0.0;
                    var r3 = 0.0;
                    var r4 = 0.0;
                    var t2 = 0;
                    var t3 = 0;
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
                        r4 = HEAP[mt + mti];
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
                return {
                    genrand_int32: genrand_int32,
                };
            }(stdlib_3.default, ffi_5.default, ffi_6.buffer)));
        }
    }
});
System.register("test-twister", ["ffi", "stdlib"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var ffi_7, ffi_8, stdlib_4;
    var MersenneTwister;
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
            exports_6("MersenneTwister", MersenneTwister = (function (stdlib, foreign, heap) {
                "use asm";
                var HEAPI32 = new stdlib.Int32Array(heap);
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
                    var $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0, $06 = 0, $07 = 0, $08 = 0, $09 = 0, $10 = 0, $11 = 0, $12 = 0, $16 = 0, $17 = 0;
                    var n = 0;
                    var t2 = 0;
                    var t3 = 0;
                    var r1 = 0.0;
                    var r3 = 0.0;
                    r1 = +1812433253;
                    mt = (malloc(N << 2) | 0) >> 2;
                    $01 = mt + 0 | 0;
                    $02 = $01 << 2;
                    $03 = s & 4294967295;
                    HEAPI32[$02 >> 2] = $03 | 0;
                    for (mti = 1; mti < N; mti = mti + 1 | 0) {
                        $04 = mti - 1 | 0;
                        $05 = mt + $04 | 0;
                        $06 = $05 << 2;
                        $07 = HEAPI32[$06 >> 2] | 0;
                        $08 = $07 >> 30;
                        $09 = mti - 1 | 0;
                        $10 = mt + $09 | 0;
                        $11 = $10 << 2;
                        $12 = HEAPI32[$11 >> 2] | 0;
                        t2 = $12 ^ $08;
                        r3 = +(r1 * +(t2));
                        t3 = ~~(r3) + mti | 0;
                        $16 = mt + mti | 0;
                        $17 = $16 << 2;
                        HEAPI32[$17 >> 2] = $17 | 0;
                        if (mti < 6) {
                            console.log('t2 = ', t2, t3, r3);
                        }
                    }
                    return 0 | 0;
                }
                function genrand_int32() {
                    var $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0, $06 = 0, $07 = 0, $08 = 0, $09 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $58 = 0, $59 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $76 = 0, $78 = 0, $79 = 0, $81 = 0, $82 = 0, $84 = 0;
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
                            $01 = kk + 1 | 0;
                            $02 = mt + $01 | 0;
                            $03 = $02 << 2;
                            $04 = HEAPI32[$03 >> 2] | 0;
                            $05 = $04 & LOWER_MASK;
                            $06 = mt + kk | 0;
                            $07 = $06 << 2;
                            $08 = HEAPI32[$07 >> 2] | 0;
                            $09 = $08 & UPPER_MASK;
                            y = $09 | $05;
                            $11 = mt + kk | 0;
                            $12 = $11 << 2;
                            $13 = y & 1;
                            $14 = mag01 + $13 | 0;
                            $15 = $14 << 2;
                            $16 = HEAPI32[$15 >> 2] | 0;
                            $17 = y >> 1;
                            $18 = kk + M | 0;
                            $19 = mt + $18 | 0;
                            $20 = $19 << 2;
                            $21 = HEAPI32[$20 >> 2] | 0;
                            $22 = $21 ^ $17;
                            $23 = $22 ^ $16;
                            HEAPI32[$12 >> 2] = $23 | 0;
                        }
                        for (; (kk | 0) < N - 1; kk = kk + 1 | 0) {
                            $24 = kk + 1 | 0;
                            $25 = mt + $24 | 0;
                            $26 = $25 << 2;
                            $27 = HEAPI32[$26 >> 2] | 0;
                            $28 = $27 & LOWER_MASK;
                            $29 = mt + kk | 0;
                            $30 = $29 << 2;
                            $31 = HEAPI32[$30 >> 2] | 0;
                            $32 = $31 & UPPER_MASK;
                            y = $32 | $28;
                            $34 = mt + kk | 0;
                            $35 = $34 << 2;
                            $36 = y & 1;
                            $37 = mag01 + $36 | 0;
                            $38 = $37 << 2;
                            $39 = HEAPI32[$38 >> 2] | 0;
                            $40 = y >> 1;
                            $41 = M - N | 0;
                            $42 = kk + $41 | 0;
                            $43 = mt + $42 | 0;
                            $44 = $43 << 2;
                            $45 = HEAPI32[$44 >> 2] | 0;
                            $46 = $45 ^ $40;
                            $47 = $46 ^ $39;
                            HEAPI32[$35 >> 2] = $47 | 0;
                        }
                        $48 = mt + 0 | 0;
                        $49 = $48 << 2;
                        $50 = HEAPI32[$49 >> 2] | 0;
                        $51 = $50 & LOWER_MASK;
                        $52 = N - 1 | 0;
                        $53 = mt + $52 | 0;
                        $54 = $53 << 2;
                        $55 = HEAPI32[$54 >> 2] | 0;
                        $56 = $55 & UPPER_MASK;
                        y = $56 | $51;
                        $58 = N - 1 | 0;
                        $59 = mt + $58 | 0;
                        $60 = $59 << 2;
                        $61 = y & 1;
                        $62 = mag01 + $61 | 0;
                        $63 = $62 << 2;
                        $64 = HEAPI32[$63 >> 2] | 0;
                        $65 = y >> 1;
                        $66 = M - 1 | 0;
                        $67 = mt + $66 | 0;
                        $68 = $67 << 2;
                        $69 = HEAPI32[$68 >> 2] | 0;
                        $70 = $69 ^ $65;
                        $71 = $70 ^ $64;
                        HEAPI32[$60 >> 2] = $71 | 0;
                        mti = 0;
                    }
                    $72 = mt + mti | 0;
                    $73 = $72 << 2;
                    y = HEAPI32[$73 >> 2] | 0;
                    mti = mti + 1 | 0;
                    $76 = y >> 11;
                    y = y ^ $76;
                    $78 = y << 7;
                    $79 = $78 & 2636928640;
                    y = y ^ $79;
                    $81 = y << 15;
                    $82 = $81 & 4022730752;
                    y = y ^ $82;
                    $84 = y >> 18;
                    y = y ^ $84;
                    return y | 0;
                }
                return {
                    genrand_int32: genrand_int32,
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
        it('And', function () {
            return expect(test2.and(42)).to.equal(42);
        });
        return it('MersenneTwister', function () {
            return expect(MersenneTwister.genrand_int32()).to.equal(192943570);
        });
    });
}, function (err) {
    return console.log(err);
});
