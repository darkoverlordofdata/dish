
# dee·ish
## /dē-ish/ 
#### a language that targets asm.js


## Why?
Emscripten is great if you have an entire c++ application to port to the browser.
But what about creating a library to use with existing javascipt? Hand coding asm.js is not pleasant.

## Performance

    time in ms
    fib(45)     browser     nodejs
    pojs        17000       26000
    dish        16000
    pojs*       14000
    llvm        10000       13000
    pojs**      00002 

    * use the llvm algorythm
    ** use iteration rather than recursion
    llvm routine copied from emscripten output

Using the same algorythms there is little difference in timing 
between emscripten and pojs or dish. Much of the emscripten runtime is 
actually pojs. Emscripten often uses the "almost asm" pragma which is pojs.
Real improvements are based on choice of algorythm and avoiding gc.

## About dish
Dish transpiles d-like code to asm.js. Code is generated from an ast using escodegen.

Dish uses the *.d extension to leverage ide syntax hghlighting. 

Dish is not intended to transpile arbitrary d to js.

Dish is a hack.

Status - evaluating poc

The goal of dish is to insulate me from the twiddly syntax of asm.js. 

Features

* uses type information to add type coercions to generated code.
* generates import/export bindings.
* generates a module header
* similar restrictions as asm.js - no strings, etc.
* module level only allows declarations - import, export, int, float, double. 
* one level of nesting - functions can only be declared at the module level.
* import/export can only be used at the module level.
* within a function: break, case, continue, do, else, for, if, return, switch, while
* added sugar for heap management and array types.
* multiple modules share 1 heap
* use 3rd party npm module 'malloc' for heap implementation. (patched to run in the browser)


### example

#### test.d
```d
module demo;

export int factorial(int p) {
    int i;
    int result = 0;

    for (i=0; i<p; i++) {
       result = result + i; 
    }
    return result;
}

```

#### test.js
```javascript
export const demo = (function(stdlib, foreign, heap) {
"use asm";
function factorial(p) {
    p = p | 0;
    var i = 0;
    var result = 0;
    result = 0;
    for (i = 0; (i | 0) < (p | 0); i = i + 1 | 0) {
        result = result + i | 0;
    }
    return result | 0;
}
return { 
    factorial:factorial
};
}(stdlib, foreign, heap))

```


### notes

A custom recursive descent parser produces SpiderMonkey AST as output. Escodegen is then used to 
generate the final javascript code. 

Esprima has an issue - literal floats with a zero floating part are truncated to ints - but only as far as asm.js
is concerned - in standard javascript there is no difference. To work around this, floats are encoded with qoute 
wrapper - i.e. '0.0'. After the call to escodegen, these wrappers are removed using regexp. This works because
quoted literals don't exist in asm.js, with the sole exception of the 'use asm' pragma, therefore any quoted
values I find are the floats that I've encoded. 


### asm.js resources

http://mrale.ph/blog/2013/03/28/why-asmjs-bothers-me.html

http://danluu.com/malloc-tutorial/

http://www.2ality.com/2013/02/asm-js.html

http://ejohn.org/blog/asmjs-javascript-compile-target/

http://asmjs.org/spec/latest/


https://www.sitepoint.com/understanding-asm-js/