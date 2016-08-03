
module entity;

export int create(int totalComponents) {
    int e;
    int entitySize;
    
    entitySize = totalComponents*4+4+4;
    e = new int[entitySize];
    return e;

}

export int getId(int entity) {
    int id;
    id = entity[0];
    return id;
}

export int setId(int entity, int id) {
    entity[0] = id;
}

export int getEnabled(int entity) {
    int enabled;
    enabled = entity[1];
    return enabled;
}

export int setEnabled(int entity, bool enabled) {
    entity[1] = enabled;
}

export int getComponent(int entity, int index) {
    int component;
    component = entity[2+index];
    return component;
}

export int setComponent(int entity, int index, int value) {
    entity[2+index] = value;
}

