/**
 * ecs.dish
 */
module ecs;

const int ID = 0
const int ASPECT = 2
const int POSITION = 4
const int VELOCITY = 8
int[] entities;

export int initialize() {
    
}
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
