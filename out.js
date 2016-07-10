/*** dish 0.0.1 ***/
/*** src/test.d ***/
{ name: 'test',
  version: '0.0.1',
  source: 'test',
  code: 'var exp = stdlib.Math.exp;\n\nvar log = stdlib.Math.log;\n\nvar myFunc = foreign.myLib.myFunc;\n\nvar xInt = 0;\n\nvar fFloat = fround(0);\n\nvar zDouble = "0.0";\n\nfunction logSum(x, y) {\n    x = +x;\n    y = y | 0;\n    var z = 0;\n    z = 42 + 13;\n    return +z;\n}\n\nfunction geometricMean() {\n    var x = 0;\n    x = 20;\n    logSum(x, 10);\n}',
  exports: { logSum: 'logSum' },
  float: true,
  heapsize: 16384,
  heapi8: false,
  heapu8: false,
  heapi16: false,
  heapu16: false,
  heapi32: false,
  heapu32: false,
  heapf32: false,
  heapf64: false }
/*** dish 0.0.1 ***/
/*** test ***/
var test = function(stdlib, foreign, heap) {
"use asm";
var fround = stdlib.Math.fround;
var exp = stdlib.Math.exp;
var log = stdlib.Math.log;
var myFunc = foreign.myLib.myFunc;
var xInt = 0;
var fFloat = fround(0);
var zDouble = "0.0";
function logSum(x, y) {
    x = +x;
    y = y | 0;
    var z = 0;
    z = 42 + 13;
    return +z;
}
function geometricMean() {
    var x = 0;
    x = 20;
    logSum(x, 10);
}    
return 
    logSum:logSum,
};
}(stdlib || window, usrlib, heap || new ArrayBuffer(16384));

