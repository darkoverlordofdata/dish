int x;

double geometricMean(int start, int end) {

    double t1 = 0.0;
    double t2 = 0.0;
    double xx = 0.0;
    xx = logSum(1, 2);

    t1 = now();
    exp(logSum(start, end) / ((end - start)));
    t2 = now();
    return t2 - t1;


}
double logSum(int start, int end) {

    int p = 0;
    int q = 0;
    int i = 0;
    int count = 0;
    double sum = 0.0;
    for (i=start; i<count; i++) {
        for (p = start/8, q = end/8; p<q; p+= 8) {
            sum = sum + 10;
        }
    }

	return sum;
}


