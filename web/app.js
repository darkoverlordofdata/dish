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
    var Ffi;
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
                return Ffi;
            })();
            exports_2("default",Ffi);
        }
    }
});
System.register("asm", ["ffi", "stdlib"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ffi_1, stdlib_1;
    var SLOW_HEAP_SIZE, FAST_HEAP_SIZE, buffer, asm;
    return {
        setters:[
            function (ffi_1_1) {
                ffi_1 = ffi_1_1;
            },
            function (stdlib_1_1) {
                stdlib_1 = stdlib_1_1;
            }],
        execute: function() {
            SLOW_HEAP_SIZE = 0x10000; /* 64k Minimum heap size */
            FAST_HEAP_SIZE = 0x40000; /* 256k for performance */
            exports_3("buffer", buffer = new ArrayBuffer(FAST_HEAP_SIZE));
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
                var now = usrlib.now;
                var HEAP8 = new stdlib.Int8Array(buffer);
                var HEAP16 = new stdlib.Int16Array(buffer);
                var HEAP32 = new stdlib.Int32Array(buffer);
                var HEAPU8 = new stdlib.Uint8Array(buffer);
                var HEAPU16 = new stdlib.Uint16Array(buffer);
                var HEAPU32 = new stdlib.Uint32Array(buffer);
                var HEAPF32 = new stdlib.Float32Array(buffer);
                var HEAPF64 = new stdlib.Float64Array(buffer);
                var t1 = 0.0;

                function test() {
                    var z = 0;
                    z = 42;
                    return z | 0;
                }

                function logSum(start, end) {
                    
                    start = start | 0;
                    end = end | 0;
                    var sum = 0.0, p = 0, q = 0, i = 0, count = 0, k = 0;
                    count = 1000;
                    for (i = start, k = 0; (i | 0) < (count | 0); i = (i + 1) | 0, k = (k + 1) | 0) {
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
                return {
                    geometricMean: geometricMean,
                    getTime: getTime,
                };
            }(stdlib_1.default, ffi_1.default, buffer)));
        }
    }
});
// Generated by CoffeeScript 1.10.0
System["import"]('asm').then(function (module) {
    console.log('asm loaded');
    return console.log("asm.getTime = " + (module.asm.getTime()));
}, function (err) {
    return console.log(err);
});
