import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'

export const mt19937 = (function(stdlib, foreign, heap) {
    "use asm";

    var HEAP = new stdlib.Uint32Array(heap);
    var malloc = foreign.malloc;
    var imul = stdlib.Math.imul;

    var N = 624;
    var M = 397;
    var MATRIX_A    = 0x9908b0df; /* constant vector a */
    var UPPER_MASK  = 0x80000000; /* most significant w-r bits */
    var LOWER_MASK  = 0x7fffffff; /* least significant r bits */

    var mt = 0;     /* ptr -> the array for the state vector  */
    var mti = 625;  /* mti==N+1 means mt[N] is not initialized */
                    
    /* initializes mt[N] with a seed */
    function init_genrand(s) {
        s = s | 0;

        mt = malloc(N<<2)|0 // malloc(N*sizeof(int))
        HEAP[mt+0>>2] = s & 0xffffffff;
        for (mti=1; (mti|0)<(N|0); mti = mti+1|0) {

            HEAP[mt+mti>>2] =
            imul(1812433253, HEAP[mt+mti-1>>2] ^ (HEAP[mt+mti-1>>2] >> 30)) + mti | 0;
            //(1812433253UL * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
            
            // (1812433253 * HEAP[mt+mti-1>>2] ^ (HEAP[mt+mti-1>>2] >> 30)) + mti | 0; 
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106x` for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            HEAP[mt+mti>>2] = HEAP[mt+mti>>2] & 0xffffffff;
            /* for >32 bit machines */
        }
    }
    /* generates a random number on [0,0xffffffff]-interval */
    function genrand_int32() {
        var y = 0;
        var mag01 = 0;
        var kk = 0;
        mag01 = malloc(2<<2)|0;
        HEAP[mag01+0>>2] = 0;
        HEAP[mag01+1>>2] = MATRIX_A;

        if ((mti|0) >= (N|0)) { /* generate N words at one time */

            if ((mti|0) == (N+1|0))   /* if init_genrand() has not been called, */
                init_genrand(5489); /* a default initial seed is used */

            for (kk=0;(kk|0)<(N-M|0);kk = kk+1|0) {
                y = (HEAP[mt+kk>>2] & UPPER_MASK) | (HEAP[mt+kk+1>>2] & LOWER_MASK);
                HEAP[mt+kk>>2] = HEAP[mt+kk+M>>2] ^ (y >> 1) ^ HEAP[(mag01+y&1)>>2];
            }
            for (;(kk|0)<(N-1|0);kk = kk+1|0) {
                y = (HEAP[mt+kk>>2] & UPPER_MASK) | (HEAP[mt+kk+1>>2] & LOWER_MASK);
                HEAP[mt+kk>>2] = HEAP[mt+kk+M-N>>2] ^ (y >> 1) ^ HEAP[(mag01+y&1)>>2];
            }
            y = (HEAP[mt+N-1>>2] & UPPER_MASK) | (HEAP[mt+0>>2] & LOWER_MASK);
            HEAP[mt+N-1>>2] = HEAP[mt+M-1>>2] ^ (y >> 1) ^ HEAP[(mag01+y&1)>>2];

            mti = 0;
        }

        y = HEAP[mt+mti>>2]|0;
        mti = mti+1|0;

        /* Tempering */
        y = y^(y >> 11);
        y = y^(y << 7) & 0x9d2c5680;
        y = y^(y << 15) & 0xefc60000;
        y = y^(y >> 18);

        return y | 0;

    }


    return { 
        genrand_int32:genrand_int32, 
    }
}(Stdlib, Ffi, buffer))
