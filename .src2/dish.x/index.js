"use strict";
/**
 * d?ish compiler
 * 
 * usage:
 *      node ./src/dish src/test.d
 * 
 */
require('coffee-script/register')
var InputStream = require('./InputStream');
var TokenStream = require('./TokenStream');
var codegen = require('./codegen');
var parse = require('./parse');
var u2 = require("uglify-js");
var util = require("util");
var fs = require('fs');

function main(argc, argv) {
    console.log("** dish **\n")
    if (argc!==3) {
        console.log("Usage: dish <filename>\n")
        process.exit(1)
    }

    var d = fs.readFileSync(argv[2], 'utf8')
    
    try {
        var js = [
            "(function(stdlib, usrlib, heap) {",
            '"use strict";',
            codegen(parse(TokenStream(InputStream(d)))),
            "}(stdlib || window, usrlib, heap || new ArrayBuffer(0x4000)));"
        ].join('');

        console.log(u2.parse(js).print_to_string({
            beautify: true,
            indent_level: 2
        }).replace(/\n\n/g, '\n'));
    } catch(ex) {
        console.log(ex);
    }


}
main(process.argv.length, process.argv)