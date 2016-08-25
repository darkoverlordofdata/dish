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
transform = require('./transform')
liquid = require('liquid.coffee')
manifest = require('../package.json')

###
 * main 
###
main = ->
    usage = """
    Usage: dish <filename>,<filelist>
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
    for file in source.split(',')
        compile file, template, output, packge, mangle, whitespace

###
 * compile each source file
###
compile = (source, template, output, packge, mangle, whitespace) ->
    console.log "dish #{manifest.version} #{packge||''}  #{source}"
    ###
     * Phase I
     *
     *  collect type information and output intermediate javascript  
     *
    ###
    if packge
        if not fs.existsSync("./dish.json")
            fs.writeFileSync "./dish.json", """
            {
                "#{packge}": {}
            }
            """
        api = require("../dish.json")

    parsed = parser.parse(lexer(fs.readFileSync(source, 'utf8')), mangle, packge)

    console.log "dish #{manifest.version} phase II/refactoring"
    code = transform.code(packge, parsed.name, parsed.ast)
    if output then fs.writeFileSync "#{output}/#{path.basename(source, '.d')}.js", code


    # try
    #     code = escodegen.generate(parsed.ast, verbatim: 'verbatim')
    # catch ex
    #     console.log '============================='
    #     console.log "Error from escodegen:", ex.message
    #     console.log '============================='
    #     fs.writeFileSync "#{output}/#{path.basename(source, '.d')}.json", JSON.stringify(parsed, null, 2)
    #     return
    
    tpl = liquid.Template.parse(fs.readFileSync(template, 'utf8'))
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
    out = out.replace(/__double__/mg, '')                       # fix-up type conversions
    out = out.replace(/__int__/mg, '~~')                        # fix-up type conversions
    out = out.replace(/\+fround/mg, 'fround')                   # fix-up type conversions
    out = out.replace(/ \| 0 \| 0/mg, '|0')                     # remove redundant coercion
    out = out.replace(/\n\n/mg, '\n') while /\n\n/.test(out)    # fix-up empty lines
    out = out.replace(/;;/mg, ';')                              # fix-up redundant semicolon

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
            symtbl: parsed.symtbl
            source: source
        }
        fs.writeFileSync "./dish.json", JSON.stringify(api, null, 2)

    if output then fs.writeFileSync "#{output}/#{path.basename(source, '.d')}.js", out

    ###
     * Phase II
     *
     *  transform intermediate javascript by refactoring expressions 
     *
     *  ex: 
     *      self.components[index] = component;
     *  to:
     *      HEAPI32[self+12+(index<<2)>>2] = component|0;
     *
    ###
    # console.log "dish #{manifest.version} phase II/refactoring"
    # out = transform.code(packge, parsed.name, out)
    # if output then fs.writeFileSync "#{output}/#{path.basename(source, '.d')}.js", out
    # else console.log out




main()