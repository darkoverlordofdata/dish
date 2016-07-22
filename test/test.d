import exp = Math.exp;
import log = Math.log;
import now = usrlib.now;

int N = 624;
int M = 397;
int MATRIX_A    = 0x9908b0df; /* constant vector a */
int UPPER_MASK  = 0x80000000; /* most significant w-r bits */
int LOWER_MASK  = 0x7fffffff; /* least significant r bits */

int mt = 0;     /* ptr -> the array for the state vector  */

int[] mt;
int mti = 625;  /* mti==N+1 means mt[N] is not initialized */


export int init_genrand(int s)
{
    int t2;

    //mt = new int[N]

    t2 = 42 & 0xffffffff;
    mt[3+1] = s & 0xffffffff;
    // for (mti=1; mti<N; mti++) {
    //     // // mt[mti] = 
    //     // // (1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti); 
    //     // t2 = (mt[mti-1] ^ (mt[mti-1] >> 30));
    //     // mt[mti] = (1812433253 * t2 + mti); 
    //     // //if (T++<5) console.log(t2, (1812433253 * t2 + mti)&0xffffffff) ;
    //     // /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
    //     // /* In the previous versions, MSBs of the seed affect   */
    //     // /* only MSBs of the array mt[].                        */
    //     // /* 2002/01/09 modified by Makoto Matsumoto             */
    //     // mt[mti] = mt[mti] & 0xffffffff;
    //     // /* for >32 bit machines */
        
    // }
    return 0;
}
