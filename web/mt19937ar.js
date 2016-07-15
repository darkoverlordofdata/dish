
/* Period parameters */  
var N = 624
var M = 397
var MATRIX_A = 0x9908b0df   /* constant vector a */
var UPPER_MASK = 0x80000000 /* most significant w-r bits */
var LOWER_MASK = 0x7fffffff /* least significant r bits */

var mt = Array(N) /* the array for the state vector  */
var mti=N+1; /* mti==N+1 means mt[N] is not initialized */
var T = 0;
var t2 = 0;

/* initializes mt[N] with a seed */
function init_genrand(s)
{
    mt[0]= s & 0xffffffff;
    for (mti=1; mti<N; mti++) {
        // mt[mti] = 
	    // (1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
        t2 = (mt[mti-1] ^ (mt[mti-1] >> 30));
        mt[mti] = (1812433253 * t2 + mti); 
        //if (T++<5) console.log(t2, (1812433253 * t2 + mti)&0xffffffff) ;
        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        mt[mti] &= 0xffffffff;
        /* for >32 bit machines */
        
    }
}


/* generates a random number on [0,0xffffffff]-interval */
function genrand_int32()
{
    var y;
    var mag01 = [0x0, MATRIX_A];
    /* mag01[x] = x * MATRIX_A  for x=0,1 */
        
    if (mti >= N) { /* generate N words at one time */
        var kk;

        if (mti == N+1)   /* if init_genrand() has not been called, */
            init_genrand(5489); /* a default initial seed is used */
        //console.log('rand ', mt[1])

        T = 0;

        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            //if (T++<5) console.log('y', y, kk, mt[kk], mt[kk+1])
            mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
        }
        for (;kk<N-1;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+(M-N)] ^ (y >> 1) ^ mag01[y & 0x1];
        }
        y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
        mt[N-1] = mt[M-1] ^ (y >> 1) ^ mag01[y & 0x1];

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

console.log("mt19937ar!")

window.testResults = [
    [genrand_int32(), genrand_int32(), genrand_int32(), genrand_int32(), genrand_int32()],
    [0,0,0,0,0]

]

var MAX = 10000
var t1 = performance.now()
for (var i=0; i<MAX; i++) {
    genrand_int32()
}
var t2 = performance.now()

console.log("mt19937ar! "+(t2-t1))