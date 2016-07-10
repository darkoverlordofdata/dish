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
var liquid = require('liquid.coffee')
var manifest = require('../package.json')

function main(argc, argv) {
    console.log(`/*** dish ${manifest.version} ***/`)
    if (argc!==3) {
        console.log("Usage: dish <filename>\n")
        process.exit(1)
    }
    console.log("/*** "+ argv[2] + " ***/")


    let d = fs.readFileSync(argv[2], 'utf8')
    let name = argv[2].split('/').pop().split('.')[0]
    

    let parsed = parser.parse(lexer(d))
    let code = codegen.generate(parsed.ast, {verbatim: 'verbatim'})
    let pretty = u2.parse(code).print_to_string({
            beautify: true,
            indent_level: 4
        })

    const data = {
        name: name,
        version: manifest.version,
        source: argv[2].split('/').pop().split('.')[0],
        code: pretty,
        exports: parsed.exports,
        float: true,
        heapsize: 0x4000,
        heapi8: false,
        heapu8: false,
        heapi16: false,
        heapu16: false,
        heapi32: false,
        heapu32: false,
        heapf32: false,
        heapf64: false
    }



    console.log(data)
    const tpl = liquid.Template.parse(fs.readFileSync("./src/asm.tpl.js", 'utf8'))
    let out = tpl.render(data)
    while (/\n\n/.test(out)) out = out.replace(/\n\n/mg, '\n') 
    console.log(out)
    process.exit(0)

    try {
        let parsed = parser.parse(lexer(d))
        let js = codegen.generate(parsed.ast, {verbatim: 'verbatim'})
        
        let asm = []

        asm.push("var " + name + " = (function(stdlib, foreign, heap) {")
        asm.push('"use asm";')
        if (parsed.float)   asm.push("var fround = stdlib.Math.fround;")
        if (parsed.heapi8)  asm.push("var HEAPI8 = new stdlib.Int8Array(heap);")
        if (parsed.heapu8)  asm.push("var HEAPU8 = new stdlib.Uint8Array(heap);")
        if (parsed.heapi16) asm.push("var HEAPI16 = new stdlib.Int16Array(heap);")
        if (parsed.heapu16) asm.push("var HEAPU16 = new stdlib.Uint16Array(heap);")
        if (parsed.heapi32) asm.push("var HEAPI32 = new stdlib.Int32Array(heap);")
        if (parsed.heapu32) asm.push("var HEAPU32 = new stdlib.Uint32Array(heap);")
        if (parsed.heapf32) asm.push("var HEAPF32 = new stdlib.Float32Array(heap);")
        if (parsed.heapf64) asm.push("var HEAPF64 = new stdlib.Float32Array(heap);")
        asm.push(js)
        asm.push(parsed.exporting)
        asm.push("}(stdlib || window, usrlib, heap || new ArrayBuffer(\"0x4000\")));")

        console.log(u2.parse(asm.join('')).print_to_string({
            beautify: true,
            indent_level: 4
        })
        .replace(/\n\n/g, '\n')
        .replace(/\"(.*)\"/g, '$1')
        .replace(/use asm;/, '"use asm";'))

    } catch(ex) {
        console.log(ex)
    }
    //console.log("done.")

}
main(process.argv.length, process.argv)


