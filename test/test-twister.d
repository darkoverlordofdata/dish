/**
 * MersenneTwister.dish
 */
module MersenneTwister;

const int N = 624;
const int M = 397;
const int MATRIX_A    = 0x9908b0df; /* constant vector a */
const int UPPER_MASK  = 0x80000000; /* most significant w-r bits */
const int LOWER_MASK  = 0x7fffffff; /* least significant r bits */

uint[] mt;       /* ptr -> the array for the state vector  */
int mti = 625;  /* mti==N+1 means mt[N] is not initialized */
int[] mag01;


int init_genrand(int s)
{

    int n;
    int t1;
    double t2;
    double t3;
    int t0;
    double r1 = +1812433253;
    double r3;
    
    mt = new int[N];
    mag01 = new int[2];
    mag01[0] = 0;
    mag01[1] = MATRIX_A;
    //[0x0, MATRIX_A];

    mt[0] = s & 0xffffffff;

    for (mti=1; (mti|0)<(N|0); mti++) {

        //mt[mti] = 
        //(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 

            // t2 = +(HEAP[mt+mti-1<<2>>2] ^ (HEAP[mt+mti-1<<2>>2] >> 30));
            // t3 = +(mti|0);
            // HEAP[mt+mti<<2>>2] = ~~((1812433253.0 * t2)+t3)|0;

        t1 = mt[mti-1] ^ (mt[mti-1] >> 30);
        t2 = to!double(t1|0);
        t3 = to!double(mti|0);
        t0 = to!int(r1*t2+t3);
        
        mt[mti] = t0 & 0xffffffff;


        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        // mt[mti] &= 0xffffffff;
        /* for >32 bit machines */
        
    }
    return 0;
}

/* generates a random number on [0,0xffffffff]-interval */
export int genrand_int32()
{
    int y;
    //int[] mag01 = [0x0, MATRIX_A];
    //int mag01[2]={0x0, MATRIX_A};
    int kk;

    /* mag01[x] = x * MATRIX_A  for x=0,1 */

    if ((mti|0) >= (N|0)) { /* generate N words at one time */

        if ((mti|0) == (N+1|0)) {  /* if init_genrand() has not been called, */
            init_genrand(5489); /* a default initial seed is used */
        }

        for (kk=0;(kk|0)<(N-M|0);kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+M] ^ (y >> 1) ^ mag01[y & 0x1];
        }
        for (;(kk|0)<(N-1|0);kk++) {
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

export int test(int n, int m) {
    int i;
    int j;
    int z;

    for (i=0|0; (i|0) < (n|0);i = i+1|0) {
        for (j=0|0; (j|0) < (m|0);j = j+1|0) {
            z = genrand_int32()|0;
        }
    }
    
}