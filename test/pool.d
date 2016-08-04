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

int inc(int i) {
    int k;
    k = i+1;
    return k;
}
export int fib(int x) {
    int result;
    int f1;
    int f2;
    int x1;
    int x2;
    int b;
    b = (x|0) < (2|0);
    if (b|0) {
        result = 1|0;
    } else {
        x1 = x-1;
        x2 = x-2;
        f2 = fib(x2);
        f1 = fib(x1);
        result = f1+f2;
    }
    return result;
}

export int fibz(int x) {
    int result;
    int f1;
    int f2;
    int x1;
    int x2;
    int b;
    int i;
    int a;
    int v1;
    int v2;
    int v3;
    int v4;
    int v5;
    b = (x|0) < (2|0);
    if (b|0) {
        result = 1|0;
    } else {
        i = 1;
        a = x;
        while (1) {
            v1 = i -1;
            v2 = fibz(v1);
            v3 = i -2;
            v4 = v2 + a;
            v5 = (v3 < 2);
            if (v5) {
                result = v4;
                return result;
                //break;
            } else {
                a = v4;
                i = v3;
            }
        }
    }
    return result;
}


export int testInc() {
    int i;
    int j;
    int k;

    i = 0;
    while(i<32767) {
        j = 0;
        while(j<32767) {
            k = j&32>>2; 
            j = j+1;
        }
        i = i+1;
    }
    return k;
}

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
    // if (getEnabled(entity) {
    //     EntityIsNotEnabledException();
    // }
    // if (getComponent(entity, index) {
    //     EntityAlreadyHasComponentException(index);
    // }
    // setComponent(entity, index, component);
    // onComponentAdded(entity, index, component);

}

export int removeComponent(int entity, int index) {

}

export int replaceComponent(int entity, int index, int component) {
}

// export int getComponent(int entity, int index) {

// }

export bool hasComponent(int entity, int index) {

}
