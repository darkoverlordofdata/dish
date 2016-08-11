
class Entity {

    int id;
    bool enabled;
    int count;
    uint[20] component;

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
        
        entitySize = 20*4+4+4+4;
        e = new int[entitySize];
        Entity(e, totalComponents);
        return e;
    }

    public void Entity(Entity self, int totalComponents) {
        self.count = totalComponents;
    }

    public int getId(Entity self) {
        int id;
        id = self.id;
        return id;
    }

    public void setId(Entity self, int id) {
        self.id = id;
    }

    public int getEnabled(Entity self) {
        int enabled;
        enabled = self.enabled;
        return enabled;
    }

    public void setEnabled(Entity self, bool enabled) {
        self.enabled = enabled;
    }

    public int getComponent(Entity self, int index) {
        int component;
        component = self.component[index];
        return component;
    }

    public void setComponent(Entity self, int index, int value) {
        self.component[index] = value;
    }

}