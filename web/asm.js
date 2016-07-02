(function(global) {

  const HEAP_SIZE = 0x40000 /* 256k Minimum practical heap size */

  const buffer = new ArrayBuffer(HEAP_SIZE)

  const stdlib = {  /* Export standard library */
    "Math": Math,
    "Int8Array": Int8Array, 
    "Int16Array": Int16Array, 
    "Int32Array": Int32Array, 
    "Uint8Array": Uint8Array, 
    "Uint16Array": Uint16Array, 
    "Uint32Array": Uint32Array, 
    "Float32Array": Float32Array, 
    "Float64Array": Float64Array, 
    "NaN": NaN, 
    "Infinity": Infinity 
  };

  const usrlib = { /* Export user library */
    now: function() {
      return performance.now();
    }
  }


  /**
   * asm.js
   * 
   * @param stdlib
   * @param usrlib
   * @param buffer
   */
  const asm = (function(stdlib, usrlib, buffer) {
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
      //env

      var xx = 0.0;
      xx = +logSum(1|0, 2|0);

      t1 =  +now();
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

  }(stdlib, usrlib, buffer))

  var t1 = asm.getTime();

  console.log("asm.geometricMean = ", t1)
}(this));
