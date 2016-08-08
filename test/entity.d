
class Entity {

    const int ID        = 0;
    const int ENABLED   = 1;
    const int COMPONENT = 2;

    /**
    * ctor 
    *
    * is invoked by new Entity(n)
    *
    * @param totalComponents
    * @returns new Entity
    */
    public Entity ctor(int totalComponents) {
        int e;
        int entitySize;
        
        entitySize = totalComponents*4+4+4;
        e = new int[entitySize];
        return e;
    }

    public int getId(Entity entity) {
        int id;
        id = entity[ID];
        return id;
    }

    public void setId(Entity entity, int id) {
        entity[ID] = id;
    }

    public int getEnabled(Entity entity) {
        int enabled;
        enabled = entity[ENABLED];
        return enabled;
    }

    public void setEnabled(Entity entity, bool enabled) {
        entity[ENABLED] = enabled;
    }

    public int getComponent(Entity entity, int index) {
        int component;
        component = entity[index + COMPONENT];
        return component;
    }

    public void setComponent(Entity entity, int index, int value) {
        entity[index + COMPONENT] = value;
    }

}