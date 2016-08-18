
class Entity {

    extern EntityIsNotEnabledException;
    extern EntityAlreadyHasComponentException;
    extern EntityDoesNotHaveComponentException;
 
    int _count;
    int _refCount;
    int _creationIndex;
    bool _isEnabled;

    int[20] components;

    /**
     * constructor
     *
     * @param totalComponents
     */
    public void Entity(int totalComponents) {
        self._count = totalComponents;
    }

    public void initialize(int creationIndex) {
        self._creationIndex = creationIndex;
        self._isEnabled = true;
    }

    public bool onComponentAdded(int index, int component) {
        return false;
    }

  /**
    *  Adds a component at a certain index. You can only have one component at an index.
    *  Each component type must have its own constant index.
    *  The prefered way is to use the generated methods from the code generator.
    *
    * @param index
    * @param component
    * @return
    */
    public Entity addComponent(int index, int component) {
        bool added;
        bool isEnabled = self._isEnabled;
        bool hasComponent = self.hasComponent(index);

        if (!isEnabled) {
            throw EntityIsNotEnabledException();
        }

        if (hasComponent) {
            throw EntityAlreadyHasComponentException(index);
        }
        self.components[index] = component;
        added = self.onComponentAdded(index, component);
        return self;
    }

  /**
    *
    *  Removes a component at a certain index. You can only remove a component at an index if it exists.
    *  The prefered way is to use the generated methods from the code generator.
    *
    * @param index
    * @return
    */
    public Entity removeComponent(int index) {
        bool isEnabled = self._isEnabled;
        bool hasComponent = self.hasComponent(index);
        if (!isEnabled) {
            throw EntityIsNotEnabledException();
        }
        if (!hasComponent) {
            throw EntityDoesNotHaveComponentException(index);
        }
        self._replaceComponent(index, 0);
        return self;
    }

  /**
    *
    *  Replaces an existing component at a certain index or adds it if it doesn't exist yet.
    *  The prefered way is to use the generated methods from the code generator.
    *
    * @param index
    * @param component
    * @return
    */
    public Entity replaceComponent(int index, int component) {
        bool isEnabled = self._isEnabled;
        bool hasComponent = self.hasComponent(index);
        if (!isEnabled) {
            throw EntityIsNotEnabledException();
        }
        if (!hasComponent) {
            self._replaceComponent(index, component);
        } else {
            self.addComponent(index, component);
        }
        return self;

    }

    public Entity updateComponent(int index, int component) {
        int previousComponent = self.components[index];
        if (previousComponent != 0) {
            self.components[index] = component;
        }
        return self;
        
    }

    public Entity _replaceComponent(int index, int component) {
        return self;
    }

    public bool hasComponent(int index) {
        return self.components[index];
    }


}