###
 * d?ish compiler
 * 
 * usage:
 *      node ./src/dish src/test.d
 * 
###
'use strict'

fs = require 'fs'
util = require 'util'
u2 = require 'uglify-js'
Lexer = require './lexer'
Parser = require './parser'
codegen = require './codegen'
npm_package = require '../../package.json'

main = (argc, argv) ->
  console.log "** dish v#{npm_package.version}**\n"

  if argc != 3
    console.log "Usage: dish <filename>\n"
    process.exit 1

  source = fs.readFileSync(argv[2], 'utf8')
  code = codegen(Parser(Lexer(source)).parse())

  try

    js = """
    (function(stdlib, usrlib, heap) {
    "use strict";
    #{code}
    }(stdlib || window, usrlib, heap || new ArrayBuffer(0x4000)));
    """

    console.log u2.parse(js).print_to_string(beautify: true, indent_level: 2).replace(/\n\n/g, '\n')
      
  catch ex
    console.log ex

  return

main process.argv.length, process.argv
