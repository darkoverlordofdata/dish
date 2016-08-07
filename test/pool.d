/**
 * pool.dish
 */
module pool;

import EntityIsNotEnabledException ;
import EntityAlreadyHasComponentException;

/** import entity methods */
import Entity.ctor;
import Entity.getId;
import Entity.setId;
import Entity.getEnabled;
import Entity.setEnabled;
import Entity.getComponent;
import Entity.setComponent;

const int POOL_SIZE = 0x1000;
bool init = true;
int[] pool;
int totalComponents;
int count;
int index;
int uniqueId;

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

/**
 * initialize
 *
 * @param count int number of components per entity
 * @returns false
 */
export void initialize(int count) {
    if (init) {
        totalComponents = count;
        uniqueId = 0;
        pool = new int[POOL_SIZE];
        init = false;
    }
}

export int getTotalComponents() {
    return totalComponents;
}

export int getCount() {
    return count;
}

export Entity createEntity() {
    Entity ent;
    int i;

    uniqueId = uniqueId+1;

    ent = new Entity(totalComponents|0);
    ent.setId(uniqueId|0);
    ent.setEnabled(1|0);
    for (i=0; i<(totalComponents|0); i++) {
        ent.setComponent(i|0, 0|0);
    }
    return ent;
}

export void destroyEntity(Entity entity) {
    free(entity|0);
}

export void destroyAllEntities() {

}

export bool hasEntity(Entity entity) {

}

export int getEntities(int matching) {

}

export int getGroup(int matching) {

}

export void updateGroupsComponentAddedOrRemoved(Entity entity, int index, int component) {

}

export void updateGroupsComponentReplaced(Entity entity, int index, int prevcomponent, int newcomponent) {

}

export void onEntityReleased(Entity entity) {

}


export void addComponent(Entity entity, int index, int component) {
    bool enabled;
    bool comp;

    enabled = entity.getEnabled();
    if (!enabled) {
        EntityIsNotEnabledException();
    }
    comp = entity.hasComponent(index)|0;
    if (comp) {
        EntityAlreadyHasComponentException(index|0);
    }
    entity.setComponent(index|0, component|0);
    // entity_onComponentAdded(entity|0, index|0, component|0);
}

export void removeComponent(Entity entity, int index) {

}

export void replaceComponent(Entity entity, int index, int component) {
}

// export int getComponent(Entity entity, int index) {

// }

export bool hasComponent(Entity entity, int index) {

}
