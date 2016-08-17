/**
 * pool.dish
 */
module pool;

import Entity = entitas.Entity;
import Position = entitas.Position;

extern EntityIsNotEnabledException;
extern EntityAlreadyHasComponentException;

const int POOL_SIZE = 0x1000;
bool init = true;
int[] pool;
int totalComponents;
int count;
int index;
int uniqueId;


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

export Position createPos(double x, double y) {
    return new Position(x, y);
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

    ent = new Entity(totalComponents);
    ent.setId(uniqueId);
    ent.setEnabled(1);
    for (i=0; i<(totalComponents|0); i++) {
        ent.setComponent(i, 0);
    }
    return ent;
}

export void destroyEntity(Entity entity) {
    //free(entity|0);
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
    comp = entity.hasComponent(index);
    if (comp) {
        EntityAlreadyHasComponentException(index);
    }
    entity.setComponent(index, component);
    //entity_onComponentAdded(entity|0, index|0, component|0);
}

export void removeComponent(Entity entity, int index) {
}

export void replaceComponent(Entity entity, int index, int component) {
}

export int getComponent(Entity entity, int index) {
}

export bool hasComponent(Entity entity, int index) {
}
