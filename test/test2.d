/**
 * Test1.dish
 */
module test2;
/**
 * Index
 * Test the heap values
 *
 * The heap is shared between modules, so this finds values set from another module
 */
export int index(int ptr, int i) {
    double x;
    int[] value;
    
    int k;
    int result;
    value = ptr;

    result = value[i];
    return result;
}

export int and(int s) {
    int[] m;
    int x;

    m = new int[10];
    
    m[0] = s & 0xffffffff;
    x = m[0];
    return x;
    
}

export int test() {

    int zz;

    zz = to!int(20.0);
    return zz;

}