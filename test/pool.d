/**
 * pool.dish
 */
module pool;

import EntityIsNotEnabledException = EntityIsNotEnabledException;
import EntityAlreadyHasComponentException = EntityAlreadyHasComponentException;

/** import entity methods */
import create = entity.create;
import getId = entity.getId;
import setId = entity.setId;
import getEnabled = entity.getEnabled;
import setEnabled = entity.setEnabled;
import getComponent = entity.getComponent
import setComponent = entity.setComponent

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
export int initialize(int count) {
    if (init) {
        totalComponents = count;
        uniqueId = 0;
        pool = new int[POOL_SIZE];
        init = 0;
    }
    return init;
}

export int getTotalComponents() {
    return totalComponents;
}

export int getCount() {
    return count;
}

export int createEntity() {
    
    int[] entity;
    int i;

    entity = entity_create(totalComponents|0);

    uniqueId = uniqueId+1;

    entity_setId(entity|0, uniqueId|0);
    entity_setEnabled(entity|0, 1|0);

    for (i=0; i<(totalComponents|0); i++) {
        entity_setComponent(entity|0, i|0, 0|0);
    }
    return entity;
}

export int destroyEntity(int entity) {
    free(entity|0);
}

export int destroyAllEntities() {

}

export int hasEntity(int entity) {

}

export int getEntities(int matching) {

}

export int getGroup(int matching) {

}

export int updateGroupsComponentAddedOrRemoved(int entity, int index, int component) {

}

export int updateGroupsComponentReplaced(int entity, int index, int prevcomponent, int newcomponent) {

}

export int onEntityReleased(int entity) {

}


export int addComponent(int entity, int index, int component) {
    // if (!(entity.getEnabled()|0)) {
    if (!(entity_getEnabled(entity|0)|0)) {
        EntityIsNotEnabledException();
    }
    // if (entity.getComponent(index|0)|0) {
    if (entity_getComponent(entity|0, index|0)|0) {
        EntityAlreadyHasComponentException(index|0);
    }
    entity_setComponent(entity|0, index|0, component|0);
    //entity_onComponentAdded(entity|0, index|0, component|0);

}

export int removeComponent(int entity, int index) {

}

export int replaceComponent(int entity, int index, int component) {
}

// export int getComponent(int entity, int index) {

// }

export bool hasComponent(int entity, int index) {

}
