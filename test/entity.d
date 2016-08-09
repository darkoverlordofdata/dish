
class Entity {

    const int ID        = 0;
    const int ENABLED   = 1;
    const int COUNT     = 2;
    const int COMPONENT = 3;
    const int MAX       = 20;

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
        
        entitySize = MAX*4+4+4+4;
        e = new int[entitySize];
        Entity(e, totalComponents);
        return e;
    }

    public void Entity(Entity self, int totalComponents) {
        self[COUNT] = totalComponents;
    }

    public int getId(Entity self) {
        int id;
        //id = self.id;
        id = self[ID];
        return id;
    }

    public void setId(Entity self, int id) {
        //self.id = id;
        self[ID] = id;
    }

    public int getEnabled(Entity self) {
        int enabled;
        enabled = self[ENABLED];
        return enabled;
    }

    public void setEnabled(Entity self, bool enabled) {
        self[ENABLED] = enabled;
    }

    public int getComponent(Entity self, int index) {
        int component;
        component = self[index + COMPONENT];
        return component;
    }

    public void setComponent(Entity self, int index, int value) {
        self[index + COMPONENT] = value;
    }

}