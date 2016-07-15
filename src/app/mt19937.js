import Ffi from 'ffi'
import {buffer} from 'ffi'
import Stdlib from 'stdlib'

export const mt19937 = (function(stdlib, foreign, heap) {
    "use asm";

    var HEAP = new stdlib.Uint32Array(heap);
    var malloc = foreign.malloc;

    var N = 624;
    var M = 397;
    var MATRIX_A    = 0x9908b0df; /* constant vector a */
    var UPPER_MASK  = 0x80000000; /* most significant w-r bits */
    var LOWER_MASK  = 0x7fffffff; /* least significant r bits */

    var mt = 0;     /* ptr -> the array for the state vector  */
    var mti = 625;  /* mti==N+1 means mt[N] is not initialized */

    var T = 0;

    function peek(addr) {
        addr = addr | 0;
        addr = addr<<2;
        return HEAP[addr>>2]|0;        
    }

    function poke(addr, value) {
        addr = addr | 0;
        value = value | 0;
        addr = addr<<2;
        HEAP[addr>>2] = value;
    }
                    
    /* initializes mt[N] with a seed */
    function init_genrand(s) {
        s = s | 0;
        var t1 = 0;
        var t2 = 0;

        mt = malloc(N<<2)|0 // malloc(N*sizeof(int))
        poke(mt, s & 0xffffffff)
        for (mti=1; (mti|0)<(N|0); mti = mti+1|0) {
            
            t1 = peek(mt+mti-1|0)|0;
            t2 = t1 >> 30;
            poke(mt+mti|0, ~~(1812433253.0 * +(t1 ^ t2) + +(mti|0))&0xffffffff);
            
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
        var y1 = 0;
        var y2 = 0;
        var mag01 = 0;
        var kk = 0;
        mag01 = malloc(2<<2)|0;
        poke(mag01, 0);
        poke(mag01+1|0, MATRIX_A)
        // HEAP[mag01+0] = 0;
        // HEAP[mag01+1] = MATRIX_A;


        if ((mti|0) >= (N|0)) { /* generate N words at one time */

            if ((mti|0) == (N+1|0))   /* if init_genrand() has not been called, */
                init_genrand(5489); /* a default initial seed is used */

            for (kk=0;(kk|0)<(N-M|0);kk = kk+1|0) {
                y = ((peek(mt+kk|0)|0) & UPPER_MASK) | ((peek(mt+kk+1|0)|0) & LOWER_MASK);
                poke(mt+kk|0, (peek(mt+kk+M|0)|0) ^ (y >> 1) ^ (peek(mag01+(y&1)|0)|0)|0);
            }
            for (;(kk|0)<(N-1|0);kk = kk+1|0) {
                y = ((peek(mt+kk|0)|0) & UPPER_MASK) | ((peek(mt+kk+1|0)|0) & LOWER_MASK);
                poke(mt+kk|0, (peek(mt+kk+M-N|0)|0) ^ (y >> 1) ^ (peek(mag01+(y&1)|0)|0)|0);
            }
            y = ((peek(mt+N-1|0)|0) & UPPER_MASK) | ((peek(mt+0|0)|0) & LOWER_MASK);

            // poke(mt+N-1, peek(mt+M-1) ^ (y >> 1) ^ peek(mag01+(y&1)));
            poke(mt+N-1|0, (peek(mt+M-1|0)|0) ^ (y >> 1) ^ (peek(mag01+(y&1)|0)|0)|0);

            mti = 0;
        }

        y = peek(mt+mti|0)|0;
        mti = mti+1|0;

        /* Tempering */
        y = y^(y >> 11);
        y = y^(y << 7) & 0x9d2c5680;
        y = y^(y << 15) & 0xefc60000;
        y = y^(y >> 18);

        return y | 0;

    }


    function test() {
        var i=0;
        var MAX = 0;
        var t1 = 0.0;
        var t2 = 0.0;
        var t = 0;

        MAX = 10000;
        // t1 = +now();
        for (i=0; (i|0) < (MAX|0); i = (i + 1)|0) {
            t = genrand_int32()|0;
        }
        // t2 = +now();
        return// +(t2 - t1);

    }

    return { 
        genrand_int32:genrand_int32, 
        test: test
    }
}(Stdlib, Ffi, buffer))