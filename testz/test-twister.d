/**
 * MersenneTwister.dish
 */
module mersenne_twister;

import exp = Math.exp;
import log = Math.log;

const int N = 624;
const int M = 397;
const int MATRIX_A    = 0x9908b0df; /* constant vector a */
const int UPPER_MASK  = 0x80000000; /* most significant w-r bits */
const int LOWER_MASK  = 0x7fffffff; /* least significant r bits */

int mt = 0;     /* ptr -> the array for the state vector  */

int[] mt;
int mti = 625;  /* mti==N+1 means mt[N] is not initialized */


int init_genrand(int s)
{

    mt = new int[N];
    mt[1] = 42;

    for (mti=1; mti<N; mti++) {
        mt[mti] = 
        (1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 

        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        mt[mti] = mt[mti+0] & 0xffffffff;
        /* for >32 bit machines */
        
    }
    return 0;
}

/* generates a random number on [0,0xffffffff]-interval */
export int genrand_int32()
{
    int y;
    int[] mag01 = [0x0, MATRIX_A];
    //int mag01[2]={0x0, MATRIX_A};
    int kk;

    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if (mti >= N) { /* generate N words at one time */

        if (mti == N+1) {  /* if init_genrand() has not been called, */
            init_genrand(5489); /* a default initial seed is used */
        }

        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
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
  
    //y = mt[mti++];
    y = mt[mti];
    mti = mti+1;

    /* Tempering */
    // y ^= (y >> 11);
    // y ^= (y << 7) & 0x9d2c5680;
    // y ^= (y << 15) & 0xefc60000;
    // y ^= (y >> 18);
    y = y ^ (y >> 11);
    y = y ^ (y << 7) & 0x9d2c5680;
    y = y ^ (y << 15) & 0xefc60000;
    y = y ^ (y >> 18);

    return y;
}