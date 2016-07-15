import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'

export const mt19937 = (function(stdlib, foreign, heap) {
    "use asm";

    // var HEAP = new stdlib.Float64Array(heap);
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
        mt = malloc(N<<3)|0 // malloc(N*sizeof(int))
        HEAP[mt+0] = s & 0xffffffff;
        for (mti=1; (mti|0)<(N|0); mti = mti+1|0) {

            //t2 = (mt[mti-1] ^ (mt[mti-1] >> 30));
            // HEAP[mt+mti] =
            // imul(1812433253, HEAP[mt+mti-1] ^ (HEAP[mt+mti-1] >> 30) + mti) | 0;
            r2 = +(HEAP[mt+mti-1] ^ (HEAP[mt+mti-1] >> 30));
            t2 = ~~(r2);
            r3 = r1 * r2;
            t3 = ~~(r3);
            HEAP[mt+mti] = (r3+mti)|0; //t3 + mti | 0;
            r4 = HEAP[mt+mti];
            if (T++<5) console.log(mt+mti, t2, r4, (r3+mti)|0);// & 0xffffffff);
            //(1812433253UL * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
            
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106x` for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            //HEAP[mt+mti] = HEAP[mt+mti] & 0xffffffff;
            /* for >32 bit machines */
        }
    }
    /* generates a random number on [0,0xffffffff]-interval */
    function genrand_int32() {
        var y = 0;
        var mag01 = 0;
        var kk = 0;
        mag01 = malloc(2<<3)|0;
        HEAP[mag01+0] = 0;
        HEAP[mag01+1] = MATRIX_A;


        if ((mti|0) >= (N|0)) { /* generate N words at one time */

            if ((mti|0) == (N+1|0))   /* if init_genrand() has not been called, */
                init_genrand(5489); /* a default initial seed is used */
            //console.log('rand ', HEAP[mt+1])
            T = 0;


        // for (kk=0;kk<N-M;kk++) {
        //     y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
        //     //if (T++<5) console.log(y)
        //     mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
        // }

            for (kk=0;(kk|0)<(N-M|0);kk = kk+1|0) {
                y = (HEAP[mt+kk] & UPPER_MASK) | (HEAP[mt+kk+1] & LOWER_MASK);
                //if (T++<5) console.log('y', y, kk, HEAP[mt+kk], HEAP[mt+kk+1])
                HEAP[mt+kk] = HEAP[mt+kk+M] ^ (y >> 1) ^ HEAP[mag01+(y&1)];
            }
            for (;(kk|0)<(N-1|0);kk = kk+1|0) {
                y = (HEAP[mt+kk] & UPPER_MASK) | (HEAP[mt+kk+1] & LOWER_MASK);
                HEAP[mt+kk] = HEAP[mt+kk+M-N] ^ (y >> 1) ^ HEAP[mag01+(y&1)];
            }
            y = (HEAP[mt+N-1] & UPPER_MASK) | (HEAP[mt+0] & LOWER_MASK);
            HEAP[mt+N-1] = HEAP[mt+M-1] ^ (y >> 1) ^ HEAP[mag01+(y&1)];

            mti = 0;
        }

        y = HEAP[mt+mti]|0;
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
