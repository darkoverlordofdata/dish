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
    int[] value;
    
    int k;
    int result;
    value = ptr;

    result = value[i];
    return result;


}
