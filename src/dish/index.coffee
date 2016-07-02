"use strict"
###
 * d?ish compiler
 * 
 * usage:
 *      node ./src/dish src/test.d
 * 
###
InputStream = require('./InputStream')
TokenStream = require('./TokenStream')
codegen = require('./codegen')
parse = require('./parse')
u2 = require('uglify-js')
util = require('util')
fs = require('fs')

main = (argc, argv) ->
    console.log "** dish **\n"
    if argc isnt 3
        console.log "Usage: dish <filename>\n" 
        process.exit 1
    

    d = fs.readFileSync(argv[2], 'utf8')
    
    js = """
        (function(stdlib, usrlib, heap) {
        "use strict"
        #{codegen(parse(TokenStream(InputStream(d))))}
        }(stdlib || window, usrlib, heap || new ArrayBuffer(0x4000)))
        """

    try 
        console.log u2.parse(js).print_to_string
            beautify: true
            indent_level: 2
    catch ex 
        console.log ex 
        throw ex 

main process.argv.length, process.argv