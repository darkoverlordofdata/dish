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

int setEntityId(int entity, int id) {
    entity[0] = id;
    return entity;
}

export int createEntity() {
    int[] entity;
    entity = new int[20];
    entity = setEntityId(entity, 42);
    return entity;
}

export int createEntity2() {
    int[] entity;
    entity = createEntity();
    return entity;
    
}

/**
 * return value at ptr+i
 */
export int test(int ptr, int i) {
    double x;
    int[] value;
    
    int k;
    int result;
    value = ptr;

    result = value[i];
    return result;
}

export void perf1(int n, int m) {
    int i;
    int j;
    int z;

    for (i=0|0; (i|0) < (n|0);i = i+1|0) {
        for (j=0|0; (j|0) < (m|0);j = j+1|0) {
            z = test(1, 0);
        }
    }    
}

export void perf2(int n, int m) {
    int i;
    int j;
    int z;

    for (i=0|0; (i|0) < (n|0);i = i+1|0) {
        for (j=0|0; (j|0) < (m|0);j = j+1|0) {
            z =Entity_test(1, 0);
        }
    }    
}
