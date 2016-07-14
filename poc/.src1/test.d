
import std.Math.exp;
import std.Math.log;
import foreign.now;

double test = 0;    //  var __test = 0;
int [4][3] b;       //  var __var_b = 0;
int []* c;          //  var __var_c = 0;
//
//  function __malloc(size, sizeof) {
//      ...  allocate size # of bytes on the HEAP<sizeof>
//  }
//
//
//  Only type of comment allowed
//
double logSum(int start, int end) {

	double sum = 0.0;
    int p = 0, q = 0, i = 0, count = 0;
    for (i=start; i<count; i=i+1) {
        for (p = start/8, q = end/8; p<q; p = p+8) {
            sum = sum + 10.0;
        }
    }

	return sum;
}


export double geometricMean(int start, int end) {

    double t1 = 0.0;
    double t2 = 0.0;
    double xx = 0.0;

    c = malloc(100);    // var __var_c = __malloc(100, 4);
    c[0] = 100;         // HEAP32[(__var_c+0>>2)] = 100;

    b[1][2] = 42;       // HEAP32[(__var_b+1*4+3)>>2] = 42;
 
    t1 = now();
    exp(logSum(start, end));
    t2 = now();
    return t2 - t1;


}

