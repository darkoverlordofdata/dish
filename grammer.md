## dish grammer

### module / class
    Define the top level javascript object. Each asm.js module is either a logical module or class.
    Use module to declare a singleton or expose static functions.

### export
    Use export to expose functions in a module.

### import
    Imports classes or functions from another asm.js module

### extern
    Declares am external function provided by the pojs container.

### new
    Allocate a a new array or type or to instantiate a class. 

### primitive types
    double      float64 data type
    float       float32 data type
    int         int32
    uint        uint32
    void        no value. 
    short       int16 (proposed)
    char        char16 (proposed)

### access
    const       mark type as read only.
    public      expose the class method
    private     do not expost the class method. Default.

### do
    do {
        ...
    } while (condition)

### while
    while (condition) {
        ...
    }

### if
    if (condition) {
        ...    
    }

#### else
    if (condition) {
        ...    
    } else {
        ...
    }

### for
    for (init; condition; update) {
        ...
    }

### switch
    switch(expression) {
        case n1:
            break; 
    }


return
break
continue
