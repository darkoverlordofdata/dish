/**
 * Test1.dish
 */
module test2;

const int ID = 0
const int ASPECT = 2
const int POSITION = 4
const int VELOCITY = 8
int[] entities;
/**
 *
 *
 * export int MovementSystem(double t) {

 *  for (e=START; e<END; e=e+SIZE)
 *      if (entities[e+ASPECT & 0x000001]) {
 *        dx = entities[e+VELOCITY];
 *        dy = entities[e+VELOCITY+2];
 *        entities[e+POSITION] = entities[e+POSITION] * dx;
 *        entities[e+POSITION+2] = entities[e+POSITION+2] * dy;
 *      }
 * }
 *
 */
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