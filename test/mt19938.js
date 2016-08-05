
/* Period parameters */  
//const mt19937 = (function() {
const mt19937 = (function(stdlib, foreign, heap) {
    "use asm";
    var malloc = foreign.malloc;
    var HEAP = new stdlib.Int32Array(heap);
    
    var N = 624
    var M = 397
    var MATRIX_A = 0x9908b0df   /* constant vector a */
    var UPPER_MASK = 0x80000000 /* most significant w-r bits */
    var LOWER_MASK = 0x7fffffff /* least significant r bits */

    //var HEAP = Array(N) /* the array for the state vector  */
    var mt = 0;
    var mti=625; //N+1; /* mti==N+1 means HEAP[mt+N] is not initialized */
    var T = 0;
    var t2 = 0.0;
    var t3 = 0.0;
    var mag01 = 0;// [0x0, MATRIX_A];

    /* initializes HEAP[mt+N] with a seed */
    function init_genrand(s)
    {
        s = s|0;
        mt = malloc(N<<2)|0;
        mag01 = malloc(2<<2)|0;
        HEAP[mag01<<2>>2] = 0;
        HEAP[(mag01+1)<<2>>2] = MATRIX_A;
        
        HEAP[mt+0<<2>>2]= s & 0xffffffff;
        for (mti=1; (mti|0)<(N|0); mti=mti+1|0) {
            // HEAP[mt+mti] = 
            // (1812433253 * (HEAP[mt+mti-1] ^ (HEAP[mt+mti-1] >> 30)) + mti); 

            t2 = +(HEAP[mt+mti-1<<2>>2] ^ (HEAP[mt+mti-1<<2>>2] >> 30));
            t3 = +(mti|0);
            HEAP[mt+mti<<2>>2] = ~~((1812433253.0 * t2)+t3)|0;
            
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array HEAP[mt+].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            //HEAP[mt+mti<<2>>2] &= 0xffffffff;
            /* for >32 bit machines */
            
        }
    }


    /* generates a random number on [0,0xffffffff]-interval */
    function genrand_int32()
    {
        var y = 0;
        var kk = 0;
        /* mag01[x] = x * MATRIX_A  for x=0,1 */
            
        if ((mti|0) >= (N|0)) { /* generate N words at one time */

            if ((mti|0) == (N+1|0))   /* if init_genrand() has not been called, */
                init_genrand(5489); /* a default initial seed is used */

            for (kk=0;(kk|0)<(N-M|0);kk=kk+1|0) {
                y = (HEAP[mt+kk<<2>>2]&UPPER_MASK)|(HEAP[mt+kk+1<<2>>2]&LOWER_MASK);
                HEAP[mt+kk<<2>>2] = HEAP[mt+kk+M<<2>>2] ^ (y >> 1) ^ HEAP[mag01+(y & 0x1)<<2>>2];
            }
            for (;(kk|0)<(N-1|0);kk=kk+1|0) {
                y = (HEAP[mt+kk<<2>>2]&UPPER_MASK)|(HEAP[mt+kk+1<<2>>2]&LOWER_MASK);
                HEAP[mt+kk<<2>>2] = HEAP[mt+kk+(M-N)<<2>>2] ^ (y >> 1) ^ HEAP[mag01+(y & 0x1)<<2>>2];
            }
            y = (HEAP[mt+N-1<<2>>2]&UPPER_MASK)|(HEAP[mt+0<<2>>2]&LOWER_MASK);
            HEAP[mt+N-1<<2>>2] = HEAP[mt+M-1<<2>>2] ^ (y >> 1) ^ HEAP[mag01+(y & 0x1)<<2>>2];

            mti = 0;
        }
    
        y = HEAP[mt+mti<<2>>2]|0;
        mti = mti+1|0;

        /* Tempering */
        y = y ^ (y >> 11);
        y = y ^ (y << 7) & 0x9d2c5680;
        y = y ^ (y << 15) & 0xefc60000;
        y = y ^ (y >> 18);

        return y|0;
    }

    function test(n, m) {
        n = n | 0;
        m = m | 0;
        var i = 0;
        var j = 0;
        var z = 0;

        for (i=0|0; (i|0) < (n|0);i = i+1|0) {
            for (j=0|0; (j|0) < (m|0);j = j+1|0) {
                z = genrand_int32()|0;
            }
        }

    }

    return { /** Export api */
        genrand_int32:genrand_int32, 
        test:test,
    };

}(Stdlib, Ffi, buffer))
//})();

