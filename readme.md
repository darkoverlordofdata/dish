
# d?ish

### dish transpiler for asmjs

Asm.js has 'int-ish' variable typing. 
Why not 'd-ish' language support?

Dish transpiles such code to asm.js.
Dish uses the *.d extension to leverage ide syntax hghlighting. 
Dish is not intended to transpile arbitrary d to js.

Dish is a hack.

Status - just starting. simple module:

		node ./src/index.js src/test.d > out.js


The goal of dish is to insulate me from the twiddly syntax of jsasm. 

* use the type information to add type coercions to generated code.
* generate import/export bindings.
* generate the module header
* add sugar for heap management and pointer types
* no SSA or TCA or other low level optimization - that is done by OdinMonkey/TurboFan

Grammer

* similar restrictions as asm.js
* module level only allows declarations - import, export, int, float, double. 
* one level of nesting - functions can only be declared at the module level.
* import/export can only be used at the module level.
* within a function: break, case, continue, do, else, for, if, return, switch, while



### example

```d
import exp from Math;
import log from Math;
import myFunc from myLib;
/*
 *
 * comment
 */
int xInt;
float fFloat;
double zDouble;

export int logSum(double x, int y) {
    int z;
    return;
}

```

```javascript
var test = function(stdlib, foreign, heap) {
    "use asm";
    var fround = stdlib.Math.fround;
    var exp = stdlib.Math.exp;
    var log = stdlib.Math.log;
    var myFunc = foreign.myLib.myFunc;
    var xInt = 0;
    var fFloat = fround(0);
    var zDouble = 0.0;
    function logSum(x, y) {
        var z = 0;
        return;
    }
    return {
        logSum: logSum
    };
}(stdlib || window, usrlib, heap || new ArrayBuffer(0x4000));
```


