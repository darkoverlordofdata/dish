
class Entity {

    extern EntityIsNotEnabledException;
    extern EntityAlreadyHasComponentException;
    extern EntityDoesNotHaveComponentException;
    extern EntityIsAlreadyReleasedException;
 
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
        this._count = totalComponents;
    }

    public void initialize(int creationIndex) {
        this._creationIndex = creationIndex;
        this._isEnabled = true;
    }

    public bool onComponentAdded(int index, int component) {
        return false;
    }

    public bool onComponentRemoved(int index, int previousComponent) {
        return false;
    }

    public bool onComponentReplaced(int index, int previousComponent, int component) {
        return false;
    }
    public bool onEntityReleased() {
        return false;
    }

    public void release() {
        bool ignore;
        this._refCount = this._refCount-1;
        if (this._refCount == 1) {
            ignore = this.onEntityReleased();
        } 
        if (this._refCount < 1) {
            throw EntityIsAlreadyReleasedException(creationIndex);
        }
    }

   /**
    *  Returns all added components.
    *
    * @return
    */
    public bool hasComponent(int index) {
        return this.components[index];
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

        if (!this._isEnabled) {
            throw EntityIsNotEnabledException();
        }

        if (this.hasComponent(index)) {
            throw EntityAlreadyHasComponentException(index);
        }
        this.components[index] = component;
        added = this.onComponentAdded(index, component);
        return this;
    }

    public Entity _replaceComponent(int index, int component) {
        bool ignore;
        int previousComponent = this.components[index];
        if (previousComponent) {
            if (previousComponent == component) {
                ignore = this.onComponentReplaced(index, previousComponent, component);
            } else {
                this.components[index] = component;
                if (!component) {
                    ignore = this.onComponentRemoved(index, previousComponent);
                } else {
                    ignore = this.onComponentReplaced(index, previousComponent, component);
                }
            }
        }
        return this;
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
        bool isEnabled = this._isEnabled;
        bool hasComponent = this.hasComponent(index);
        int ignore;

        if (isEnabled) {
            throw EntityIsNotEnabledException();
        }
        if (hasComponent) {
            throw EntityDoesNotHaveComponentException(index);
        }
        ignore = this._replaceComponent(index, 0);
        return this;
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
        bool isEnabled = this._isEnabled;
        bool hasComponent = this.hasComponent(index);
        int ignore;

        if (!isEnabled) {
            throw EntityIsNotEnabledException();
        }
        if (hasComponent) {
            ignore = this.addComponent(index, component);
        }
        if (!hasComponent) {
            ignore = this._replaceComponent(index, component);
        } 
        return this;
    }

    public Entity updateComponent(int index, int component) {
        int previousComponent = this.components[index];
        if (previousComponent) {
            this.components[index] = component;
        }
        return this;
    }


   /**
    *  Returns a component at a certain index. You can only get a component at an index if it exists.
    *  The prefered way is to use the generated methods from the code generator.
    *
    * @param index
    * @return
    */
    public int getComponent(int index) {
        bool component = this.hasComponent(index);
        if (!component) {
            throw EntityDoesNotHaveComponentException(index);
        }
        return component;
    }

    
    public bool hasComponents(int[] indices) {
        int i;
        int index;
        int component;

        for (i=0; i<20; i++) {
            index = indices[i];
            if (index) {
                component = this.components[index];
                if (!component) {
                    return false;
                }
            }
        }
        return true;
    }

    public bool hasAnyComponent(int[] indices) {
        int i;
        int index;
        int component;

        for (i=0; i<20; i++) {
            index = indices[i];
            if (index) {
                component = this.components[index];
                if (component) {
                    return true;
                }
            }
        }
        return false;
    }

    public void removeAllComponents() {
        int i;
        int component;
        int ignore;
        

        for (i=0; i<20; i++) {
            component = this.components[i];
            if (component) {
                ignore = this._replaceComponent(i, 0);
            }
        }
    }

    public Entity retain() {
        int refCount = this._refCount;
        this._refCount = refCount+1;
        return this;
    }

    public void destroy() {
        this.removeAllComponents();
        this._isEnabled = false;
    }

}