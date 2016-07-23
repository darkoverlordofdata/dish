#!/usr/bin/env coffee
###
 * d?ish compiler
 * 
 * usage:
 *      coffee ./src/dish src/test.d
 * 
###
'use strict'
fs = require('fs')
path = require('path')
util = require("util")
args = require('./args')
lexer = require('./lexer')
parser = require('./parser')
codegen = require('escodegen')
liquid = require('liquid.coffee')
manifest = require('../package.json')

usage = """
Usage: dish <filename>
    -o --output        output file name
    -t --template      template file name
"""

if args.count<3 
    console.log usage
    process.exit 1

source    = args()
template  = args '-t', '--template', './src/asm.tpl.js'
output    = args '-o', '--output'

console.log "*** dish #{manifest.version} ***"
console.log "*** #{source} ***"

parsed = parser.parse(lexer(fs.readFileSync(source, 'utf8')))
tpl = liquid.Template.parse(fs.readFileSync(template, 'utf8'))

code = codegen.generate(parsed.ast, verbatim: 'verbatim')
    .replace(/\('0.0'\)/g, '0.0') # reverse verbatim option

out = tpl.render
    name:       parsed.name
    version:    manifest.version
    source:     source
    code:       code
    heapsize:   0x4000
    exports:    parsed.exports
    float:      parsed.float
    heapi8:     parsed.heapi8
    heapu8:     parsed.heapu8
    heapi16:    parsed.heapi16
    heapu16:    parsed.heapu16
    heapi32:    parsed.heapi32
    heapu32:    parsed.heapu32
    heapf32:    parsed.heapf32
    heapf64:    parsed.heapf64
    usemalloc:  parsed.usemalloc

out = out.replace(/\n\n/mg, '\n') while /\n\n/.test(out) # fix-up empty lines
     
if output then fs.writeFileSync output, out
else console.log out



