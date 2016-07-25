/**
 * Test1.dish
 */
module test1;

int[] buf;

export int factorial(int p) {
    int i;
    int result = 0;

    for (i=0; i<p; i++) {
       result = result + i; 
    }
    return result;
}

export int alloc(int n) {

    buf = new int[n];
    return buf;
}

export int index(int i) {
    int[] value = [42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
    
    int k;
    int result;

    //TODO: wrong result without the +0
    result = value[i]+0;
    return result;


}