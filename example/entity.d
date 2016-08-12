
class Entity {

    int id;
    bool enabled;
    int count;
    uint[20] component;

    /**
     * constructor
     *
     * @param totalComponents
     */
    public void Entity(int totalComponents) {
        self.count = totalComponents;
    }

    public int getId() {
        return self.id;
    }

    public void setId(int id) {
        self.id = id;
    }

    public int getEnabled() {
        return self.enabled;
    }

    public void setEnabled(bool enabled) {
        self.enabled = enabled;
    }

    public int getComponent(int index) {
        return self.component[index];
    }

    public void setComponent(int index, int value) {
        self.component[index] = value;
    }

}