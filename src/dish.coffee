#!/usr/bin/env coffee
###
 * dē-ish compiler
 * 
 * usage:
 *      node ./src/dish.js test/test.d -m -w --output test/test.js
 * 
###
'use strict'
fs = require('fs')
path = require('path')
util = require("util")
{args, flags} = require('./args')
lexer = require('./lexer')
parser = require('./parser')
esprima = require('esprima')
esmangle = require('esmangle')
escodegen = require('escodegen')
liquid = require('liquid.coffee')
manifest = require('../package.json')

usage = """
Usage: dish <filename>
    -o --output         output file name
    -t --template       template file name
    -m --mangle         mangle output
    -w --whitespace     remove whitespace
    -p --package        package name
"""

if args.count<3 
    console.log usage
    process.exit 1

template    = args  '-t', '--template', './src/asm.tpl.js'
output      = args  '-o', '--output'
packge      = args  '-p', '--package'
mangle      = flags '-m', '--mangle'
whitespace  = flags '-w', '--whitespace'

source      = args()

console.log "dish #{manifest.version} #{packge||''}  #{source}"
if packge
    if not fs.existsSync("./dish.json")
        fs.writeFileSync "./dish.json", """
        {
            "#{packge}": {}
        }
        """
    api = require("../dish.json")

parsed = parser.parse(lexer(fs.readFileSync(source, 'utf8')), mangle, packge)

tpl = liquid.Template.parse(fs.readFileSync(template, 'utf8'))
code = escodegen.generate(parsed.ast, verbatim: 'verbatim')

out = tpl.render
    name:       parsed.name
    version:    manifest.version
    level:      'use'
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
    malloc:     parsed.malloc

###
 * Fix Ups
###
out = out.replace(/var __ZZ__ = 0;/mg, '')                           # fix-up placeholder
out = out.replace(/__double__/mg, '')                       # fix-up type conversions
out = out.replace(/__int__/mg, '~~')                        # fix-up type conversions
out = out.replace(/\+fround/mg, 'fround')                   # fix-up type conversions
out = out.replace(/ \| 0 \| 0/mg, '|0')                     # fix-up redundant coercion
out = out.replace(/\n\n/mg, '\n') while /\n\n/.test(out)    # fix-up empty lines

if mangle
    i = out.indexOf(parsed.name)
    if i>0 
        lhs = out.substr(0,i)       # import statements
        rhs = out.substr(i)         # module code
        ast = esprima.parse(rhs)
        res = esmangle.mangle(ast)
        out = lhs+escodegen.generate(res, format: compact: whitespace)
            .replace(/'0.0'/g, '0.0')               # reverse verbatim option
    else out = out.replace(/\('0.0'\)/g, '0.0')     # reverse verbatim option
else out = out.replace(/\('0.0'\)/g, '0.0')         # reverse verbatim option

if output then fs.writeFileSync output, out
else console.log out

###
 * Update package api info
###
if packge
    api[packge][parsed.name] = {
        name:   parsed.name,
        class:  parsed.class
        size:   parsed.size
        api:    parsed.api
        data:   parsed.data
        source: source
    }
    fs.writeFileSync "./dish.json", JSON.stringify(api, null, 2)




