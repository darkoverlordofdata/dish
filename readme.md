
# dee·ish
## /dē-ish/ 
#### a language that targets asm.js

## Why?
Emscripten is great if you have an entire c++ application to port to the browser.
But what about creating a library to use with existing javascipt? Hand coding asm.js is not pleasant.

## About dish
Dish uses the *.d extension to leverage ide syntax hghlighting, and is not intended to transpile arbitrary d to js.

The goal of dish is to insulate me from the twiddly aspects of asm.js. 

## Features

* transpiles to 'asm.js'
* similar restrictions as asm.js:
    * no strings.
    * module level only allows declarations - import, export, int, float, double, void. 
    * one level of nesting - functions can only be declared at the module level.
* uses type information to add type coercions to generated code.
* generates import/export bindings.
* generates a module header
* multiple modules share 1 heap
* array types
* lite-weight objects
    * an object is a pointer to a struct created on the heap.
    * an asm.js module is used as a class. The penalty of cross-module calls is insignificant-
        less than 0.1% / 5ms per billion calls
* use 3rd party npm module 'malloc' for heap implementation. (patched to run in the browser)

## Example

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

## Interop

```coffee
    it 'Create Position Object', ->

        pool.initialize(10)
        pos = pool.createPos(95.0, 96.0)
        fm = pool.createPos(99.9, 107.7)
        expect(Position.getX(pos)).to.equal(95)
        expect(Position.getY(pos)).to.equal(96)
```

## Status
Not yet robust, the MersenneTwister demo code is on the 'happy path'.
It runs about 20% faster than the original pojs code. (545 vs 405ms)
With compression and whitespace removal, it is also about the same size as the original.


## Notes

A custom recursive descent parser produces SpiderMonkey AST as output. Escodegen is then used to 
generate the final javascript code. 

Esprima has an issue - literal floats with a zero floating part are truncated to ints - but only as far as asm.js
is concerned - in standard javascript there is no difference. To work around this, floats are encoded with qoute 
wrapper - i.e. '0.0'. After the call to escodegen, these wrappers are removed using regexp. This works because
quoted literals don't exist in asm.js, with the sole exception of the 'use asm' pragma, therefore any quoted
values I find are the floats that I've encoded. 


Simple oop object reference is a pointer into the heap



                        heap:
                        ------------
        var entity ->   |		| <- this = malloc(n)
                        ------------
                        |		|	|
                        ------------
                        |		|	|
                        ------------
                        |		| <-
                        ------------
                        |		|
                        ------------
                        |		|
                        ------------



http://orion.lcg.ufrj.br/Dr.Dobbs/books/book2/algo022e.htm

### asm.js resources

http://mrale.ph/blog/2013/03/28/why-asmjs-bothers-me.html

http://www.2ality.com/2013/02/asm-js.html

http://ejohn.org/blog/asmjs-javascript-compile-target/

http://asmjs.org/spec/latest/

https://www.sitepoint.com/understanding-asm-js/