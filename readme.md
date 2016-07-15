
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

Status - happy path only

		node ./src/dish.js test/test.d > test/test.js


The goal of dish is to insulate me from the twiddly syntax of asm.js. 

* use the type information to add type coercions to generated code.
* generate import/export bindings.
* generate the module header
* ?? no algorythmic optimization. produce idiomatic code so that OdinMonkey or TurboFan will optimize. ??

Grammer

* similar restrictions as asm.js
* module level only allows declarations - import, export, int, float, double. 
* one level of nesting - functions can only be declared at the module level.
* import/export can only be used at the module level.
* within a function: break, case, continue, do, else, for, if, return, switch, while

Todo: 

* add sugar for heap management and pointer types
* char type as int. So 'a' is the same as 97|0

### example

#### test.d
```d
import log from Math;
import now from usrlib;

export int logSum(int start, int end) {
    int z=42;
    int k;
    for (k=start; k<end; k++) {
        z = z+k;
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
    z = 42;
    for (k = start; (k | 0) < (end | 0); k = k + 1 | 0) {
        z = z + k;
    }
    return z | 0;
}    
return { 
    logSum:logSum, 
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));
```


### resources

http://mrale.ph/blog/2013/03/28/why-asmjs-bothers-me.html

http://danluu.com/malloc-tutorial/

http://www.2ality.com/2013/02/asm-js.html

http://ejohn.org/blog/asmjs-javascript-compile-target/

http://asmjs.org/spec/latest/


### notes

I'm using esprima ast 'schema' as my target.  Then, escodegen is used to generate the final javascript code.
Code is parsed with recursive descent. My parser stops when it get's to an expression, and hands off to jsep, 
which also generates esprima schema. I do some munging of the expression - adding type coercions - prior to
the handoff. 

Esprima has 1 issue - literal floats with a zero floating part are truncated to ints - but only as far as asm.js
is concerned - in standard javascript there is no difference. To work around this, floats are encoded with qoute 
wrapper - i.e. '0.0'. After the call to escodegen, these wrappers are removed using regexp. This works because
quoted literals don't exist in asm.js, with the sole exception of the 'use asm' pragma, therefore any quoted
values I find are the floats that I've encoded. 


### testing

compare run times with asmjs disabled

also implement merseene twister prng. http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html
Compare also to my mt19937.ts project

