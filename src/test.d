import exp from Math;
import log from Math;
import now from usrlib;

double logSum(int start, int end) {
    
    double sum;
    int p;
    int q;
    int i;
    int count;
    int k;

    count = 1000;
    for (i = start, k = 0; i < count; i=i+1, k=k+1) {
        for (p = start, q = end; p < q; p=p+1) {
            sum = sum + HEAPF64[p];
        }
    }
    return sum;
}
