
# dee·ish


### dish, or \dē-ˈiSH\,  is a d-like transpiler for asm.js

## Why?
Emscripten is great if you have an entire c++ application to port to the browser.

But what about creating a library to use with existing javascipt? Hand coding asm.js is not pleasant.

## About dish
Dish transpiles d-like code to asm.js.

Dish uses the *.d extension to leverage ide syntax hghlighting. 

Dish is not intended to transpile arbitrary d to js.

Dish is a hack.

Status - just starting. simple module:

		node ./src/index.js src/test.d > out.js


The goal of dish is to insulate me from the twiddly syntax of asm.js. 

* use the type information to add type coercions to generated code.
* generate import/export bindings.
* generate the module header
* add sugar for heap management and pointer types
* no algorythmic optimization. produce idiomatic code so that the OdinMonkey or TurboFan will optimize.

Grammer

* similar restrictions as asm.js
* module level only allows declarations - import, export, int, float, double. 
* one level of nesting - functions can only be declared at the module level.
* import/export can only be used at the module level.
* within a function: break, case, continue, do, else, for, if, return, switch, while



### example

#### test.d

```d
import log from Math;
import now from usrlib;

export int logSum(int start, int end) {
    int z;
    int k;
    for (k=start; k<end; k++) {
        z = k;
    }
    return z;
}

```

#### test.js
```javascript
var test = function(stdlib, foreign, heap) {
"use asm";
var log = stdlib.Math.log;
var now = foreign.usrlib.now;
function logSum(start, end) {
    start = start | 0;
    end = end | 0;
    var z = 0;
    var k = 0;
    for (k = start; (k | 0) < (end | 0); k = k + 1 | 0) {
        z = k;
    }
    return z | 0;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
```


