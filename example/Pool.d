/**
 * pool.dish
 */
class Pool {

    extern EntityIsNotEnabledException;
    extern EntityAlreadyHasComponentException;

    import Entity = entitas.Entity;

    int _creationIndex;
    int[] _entities;
    int[] _groups;
    int[] _groupsForIndex;
    int[] _reusableEntities;
    int[] _retainedEntities;
    int[] _entitiesCache;

    int count;
    int reusableEntitiesCount;
    int retainedEntitiesCount;


    public void Pool(int startCreationIndex) {
        this._creationIndex = startCreationIndex;

    }

    public bool onEntityCreated(Entity entity) {
        return false;
    }

    public Entity createEntity() {
        //bool ignore;
        int creationIndex = this._creationIndex+1;
        Entity entity = new Entity(20);
        this._creationIndex = creationIndex;
        entity.initialize(creationIndex);
        entity.retain();
        // entity.onComponentAdded += updateGroupsComponentAddedOrRemoved
        // entity.onComponentRemoved += updateGroupsComponentAddedOrRemoved
        // entity.onComponentReplaced += updateGroupsComponentReplaced
        // entity.onEntityReleased += onEntityReleased
        // _entities.add(entity)
        // _entitiesCache.clear()
        //ignore = this.onEntityCreated(entity);
        return entity;
    }
}