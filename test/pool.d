/**
 * pool.dish
 */
module pool;

import entity_getId = entity.getId;
import entity_setId = entity.setId;
import entity_getEnabled = entity.getEnabled;
import entity_setEnabled = entity.setEnabled;
import entity_getComponent = entity.getComponent
import entity_setComponent = entity.setComponent


import EntityIsNotEnabledException = exceptions.EntityIsNotEnabledException;
import EntityAlreadyHasComponentException = exceptions.EntityAlreadyHasComponentException;

const int POOL_SIZE = 0x1000;
bool init = true;
int[] pool;
int totalComponents;
int count;
int index;
int entitySize;
int uniqueId;

export int test(int ptr, int i) {
    double x;
    int[] value;
    
    int k;
    int result;
    value = ptr;

    result = value[i];
    return result;
}

export int initialize(int count) {
    if (init) {
        totalComponents = count;
        entitySize = count*4+COMPONENTS*4;
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

export int createEntity() {
    int[] entity = new int[entitySize];
    int i;

    uniqueId = uniqueId+1;
    entity_setId(entity, uniqueId);
    entity_setEnabled(entity, true);

    for (i=0; i<totalComponents; i++) {
        entity_setComponent(entity, i, 0);
    }
    return entity;
}

export int destroyEntity(int entity) {
    free(entity);
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
    // if (entity_getEnabled(entity) {
    //     EntityIsNotEnabledException();
    // }
    // if (entity_getComponent(entity, index) {
    //     EntityAlreadyHasComponentException(index);
    // }
    entity_setComponent(entity, index, component);
    onComponentAdded(entity, index, component);

}

export int removeComponent(int entity, int index) {

}

export int replaceComponent(int entity, int index, int component) {
}

export int getComponent(int entity, int index) {

}

export bool hasComponent(int entity, int index) {

}
