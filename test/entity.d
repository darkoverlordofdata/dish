
module Entity;

const int ID  = 0;
const int ENABLED = 1;
const int COMPONENT = 2;

/**
 * ctor 
 *
 * is invoked by new Entity(n)
 *
 * @param totalComponents
 * @returns new Entity
 */
export Entity ctor(int totalComponents) {
    int e;
    int entitySize;
    
    entitySize = totalComponents*4+4+4;
    e = new int[entitySize];
    return e;
}

export int getId(Entity entity) {
    int id;
    id = entity[ID];
    return id;
}

export void setId(Entity entity, int id) {
    entity[ID] = id;
}

export int getEnabled(Entity entity) {
    int enabled;
    enabled = entity[ENABLED];
    return enabled;
}

export void setEnabled(Entity entity, bool enabled) {
    entity[ENABLED] = enabled;
}

export int getComponent(Entity entity, int index) {
    int component;
    component = entity[COMPONENT+index];
    return component;
}

export void setComponent(Entity entity, int index, int value) {
    entity[COMPONENT+index] = value;
}

