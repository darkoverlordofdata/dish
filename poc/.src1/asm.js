
import Ffi from 'ffi'
import Stdlib from 'stdlib'

const SLOW_HEAP_SIZE = 0x10000 /* 64k Minimum heap size */
const FAST_HEAP_SIZE = 0x40000 /* 256k for performance */

export const buffer = new ArrayBuffer(FAST_HEAP_SIZE)

/**
 * asm.js
 * 
 * @param stdlib
 * @param usrlib
 * @param buffer
 */
export const asm = (function(stdlib, usrlib, buffer) {
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

  function logSum(start, end) {
    start = start|0;
    end = end|0;

    var sum = 0.0, p = 0, q = 0, i = 0, count = 0;
    count = 1000;
    for (i=start; (i|0) < (count|0); i = (i + 1)|0) {
      // asm.js forces byte addressing of the heap by requiring shifting by 3
      for (p = start << 3, q = end << 3; (p|0) < (q|0); p = (p + 8)|0) {
        sum = sum + +log(HEAPF64[p>>3]);
      }
    }
    return +sum;
  }

  function geometricMean(start, end) {
    start = start|0;
    end = end|0;

    var t1 = 0.0;
    var t2 = 0.0;
    var xx = 0.0;
    xx = +logSum(1|0, 2|0);

    t1 = +now();
    +exp(+logSum(start, end) / +((end - start)|0));
    t2 = +now();
    return +(t2 - t1);

    
  }

  function getTime() {
    t1 = +geometricMean(10|0, 20000|0);
    return +t1;
  }
  return { 
    geometricMean: geometricMean,
    getTime: getTime
  };

}(Stdlib, Ffi, buffer))

