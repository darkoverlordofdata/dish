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
                    
    /* initializes mt[N] with a seed */
    function init_genrand(s) {
        s = s | 0;
        var t1 = 0;
        var t2 = 0;
        var t3 = 0;
        var $00 = 0, $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0, $06 = 0.0, $07 = 0.0, $08 = 0.0, $09 = 0;
        mt = malloc(N<<2)|0 // malloc(N*sizeof(int))
        mt = mt >> 2

        // following line prevents full aot compilation for performanace testing.
        //var flawed_mode = 0
        // comment the previuos line to run in unflawed mode.

        $00 = mt | 0;
        $00 = $00<<2;
        HEAP[$00>>2] = s & 0xffffffff;
        //mt[0]= s & 0xffffffffUL;
        
        for (mti=1; (mti|0)<(N|0); mti = mti+1|0) {

            $01 = mt + mti|0
            $02 = $01 - 1|0
            $03 = $02 << 2
            // $04 = HEAP[$03>>2]|0
            $04 = HEAP[$02<<2>>2]|0
            $05 = $04 >> 30
            $06 = +($04 ^ $05)
            $07 = $06 * 1812433253.0
            $08 = $07 + +(mti|0)
            // mt[mti] = 
            // (1812433253UL * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106x` for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            $09 = $01 << 2
            HEAP[$09>>2] = ~~($08) & 0xffffffff
            // mt[mti] &= 0xffffffffUL;
            /* for >32 bit machines */
        }
        //for (var x=0; x<20; x++) console.log(HEAP[mt+x])
    }
    /* generates a random number on [0,0xffffffff]-interval */
    function genrand_int32() {
        var y = 0;
        var y1 = 0;
        var y2 = 0;
        var mag01 = 0;
        var kk = 0;
        var $00 = 0, $01 = 0, $02 = 0, $03 = 0, $04 = 0, $05 = 0, $06 = 0, $07 = 0, $08 = 0;
        var $09 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0;
        var $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0;

        mag01 = malloc(2<<2)|0
        mag01 = mag01 >> 2

        $00 = (mag01 + 0|0)<<2
        HEAP[$00>>2] = 0
        $00 = (mag01 + 1|0)<<2
        HEAP[$00>>2] = MATRIX_A
        
        if ((mti|0) >= (N|0)) { /* generate N words at one time */

            if ((mti|0) == (N+1|0))   /* if init_genrand() has not been called, */
                init_genrand(5489); /* a default initial seed is used */

            for (kk=0;(kk|0)<(N-M|0);kk = kk+1|0) {
                $01 = mt + kk|0

                $02 = $01 << 2
                // $03 = HEAP[$02>>2]|0

                $03 = HEAP[$01<<2>>2]|0
                
                $04 = $03 & UPPER_MASK
                $05 = ($01 + 1|0)
                $06 = $05 << 2
                $07 = HEAP[$06>>2]|0
                $08 = $07 & LOWER_MASK
                y = $08 | $04
                // y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
                $09 = $01 + M|0
                $10 = $09 << 2
                $11 = HEAP[$10>>2]|0
                $12 = y >> 1
                $13 = $11 ^ $12
                $14 = y & 1
                $15 = mag01 + $14|0
                $16 = $15 << 2
                $17 = HEAP[$16>>2]|0 
                HEAP[$02>>2] = $17 ^ $13
                // mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1UL];
            }
            for (;(kk|0)<(N-1|0);kk = kk+1|0) {
                $01 = mt + kk|0
                $02 = $01 << 2
                $03 = HEAP[$02>>2]|0
                $04 = $03 & UPPER_MASK
                $05 = $01 + 1|0
                $06 = $05 << 2
                $07 = HEAP[$06>>2]|0
                $08 = $07 & LOWER_MASK
                y = $08 | $04
                // y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
                $09 = $01 + M|0
                $10 = $09 - N|0
                $11 = $10 << 2
                $12 = HEAP[$11>>2]|0
                $13 = y >> 1
                $14 = $12 ^ $13
                $15 = y & 1
                $16 = mag01 + $15|0
                $17 = $16 << 2
                $18 = HEAP[$17>>2]|0
                HEAP[$02>>2] = $18 ^ $14
                // mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1UL];
            }

            $01 = mt + N|0
            $02 = $01 -1|0
            $03 = $02 << 2
            $04 = HEAP[$03>>2]|0
            $05 = $04 & UPPER_MASK
            $06 = mt|0
            $07 = $06 << 2
            $08 = HEAP[$07>>2]|0
            $09 = $08 & LOWER_MASK
            y = $09 | $05
            // y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
            $10 = mt + M|0
            $11 = $10 -1|0
            $12 = $11 << 2
            $13 = HEAP[$12>>2]|0
            $14 = y >> 1
            $15 = $14 ^ $13
            $16 = y & 1
            $17 = mag01 + $16|0
            $18 = $17 << 2
            $19 = HEAP[$18>>2]|0
            $20 = mt + N|0
            $21 = $20 - 1|0
            $22 = $21 << 2
            HEAP[$22>>2] = $19 ^ $15
            // mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1UL];

            mti = 0;
        }

        $00 = (mt + mti)<<2
        y = HEAP[$00>>2]|0
        // y = mt[mti++];
        mti = mti+1|0;

        /* Tempering */
        $01 = y >> 11
        $02 = y ^ $01
        $03 = $02 << 7
        $04 = $03 & 0x9d2c5680
        $05 = $02 ^ $04
        $06 = $05 << 15
        $07 = $06 & 0xefc60000
        $08 = $05 ^ $07
        $09 = $08 >> 18
        y = $08 ^ $09
        // y ^= (y >> 11);
        // y ^= (y << 7) & 0x9d2c5680UL;
        // y ^= (y << 15) & 0xefc60000UL;
        // y ^= (y >> 18);

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