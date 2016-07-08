/**
 * d?ish compiler
 * 
 * usage:
 *      node ./src/dish src/test.d
 * 
 */
'use strict'
var fs = require('fs')
var util = require("util")
var u2 = require("uglify-js")
var lexer = require('./lexer')
var parser = require('./parser')
var codegen = require('escodegen')

function main(argc, argv) {
    console.log("** dish **\n")
    if (argc!==3) {
        console.log("Usage: dish <filename>\n")
        process.exit(1)
    }

    let d = fs.readFileSync(argv[2], 'utf8')
    

    try {
        let ast = parser.parse(lexer(d))
        let js = codegen.generate(ast, {verbatim: 'verbatim'})
        let asm = [
            "(function(stdlib, foreign, heap) {",
            '"use asm";',
            "var HEAPI8 = new stdlib.Int8Array(heap);",
            "var HEAPU8 = new stdlib.Uint8Array(heap);",
            "var HEAPI16 = new stdlib.Int16Array(heap);",
            "var HEAPU16 = new stdlib.Uint16Array(heap);",
            "var HEAPI32 = new stdlib.Int32Array(heap);",
            "var HEAPU32 = new stdlib.Uint32Array(heap);",
            "var HEAPI32 = new stdlib.Int32Array(heap);",
            "var HEAPF32 = new stdlib.Float32Array(heap);",
            "var HEAPF64 = new stdlib.Float64Array(heap);",
            js,
            "}(stdlib || window, usrlib, heap || new ArrayBuffer(\"0x4000\")));"
        ].join('')

        console.log(u2.parse(asm).print_to_string({
            beautify: true,
            indent_level: 4
        })
        .replace(/\n\n/g, '\n')
        .replace(/\"(.*)\"/g, '$1')
        .replace(/use asm;/, '"use asm";'))

    } catch(ex) {
        console.log(ex)
    }
    console.log("done.'")


}
main(process.argv.length, process.argv)