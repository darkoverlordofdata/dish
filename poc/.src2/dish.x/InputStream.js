/**
 * InputStream.js
 * 
 */
"use strict";

module.exports = 
function InputStream(input) {
    var pos = 0, line = 1, col = 0;
    return {
        next  : next,
        peek  : peek,
        peek2 : peek2,
        eof   : eof,
        croak : croak,
    };
    function next() {
        var ch = input.charAt(pos++);
        if (ch == "\n") line++, col = 0; else col++;
        return ch;
    }
    function peek() {
        return input.charAt(pos);
    }
    function peek2() {
        return input.substr(pos,2);
    }
    function eof() {
        return peek() == "";
    }
    function croak(msg) {
        throw new Error(msg + " (" + line + ":" + col + ")");
    }
}
