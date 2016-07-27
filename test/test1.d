/**
 * Test1.dish
 */
module test1;

int[] buf;

/**
 * Factorial
 * calc the factorial of n
 */
export int factorial(int n) {
    int i;
    int result = 0;

    for (i=0; i<n; i++) {
       result = result + i; 
    }
    return result;
}

/**
 * Alloc
 * allocate n ints on the heap, and return the address
 */
export int alloc(int n) {

    buf = new int[n];
    return buf;
}

/**
 * Index
 * Test the heap values
 */
export int values(int i) {
    int[] value = [42, 43, 44, 45, 46, 47, 48, 49, 50, 51];

    int k;
    int result;

    result = value[i];
    return value;

}