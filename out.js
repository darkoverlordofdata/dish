/*** dish 0.0.1 ***/
/*** src/test.d ***/
Expecting delimiter: [;] found Delimiter '}' at line 16, col 1
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
