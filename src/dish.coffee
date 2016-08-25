#!/usr/bin/env coffee
###
 * dē-ish compiler
 * 
 * usage:
 *
 * dish example/Position.d,example/Entity.d,example/Pool.d \
 *      --package entitas \
 *      --template example/asm.tpl.js \  
 *      --output build 
 * 
###
'use strict'

fs = require('fs')
path = require('path')
util = require("util")
{args, flags} = require('./args+flags')
lexer = require('./lexer')
parser = require('./parser')
esprima = require('esprima')
esmangle = require('esmangle')
escodegen = require('escodegen')
transform = require('./transform')
liquid = require('liquid.coffee')
manifest = require('../package.json')

###
 * Process the command line args 
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

    compile(
        source,
        args('-t', '--template', './src/asm.tpl.js'),
        args('-o', '--output'),
        args('-p', '--package'),
        flags('-m', '--mangle'),
        flags('-w', '--whitespace')
        ) for source in args().split(',')



###
 * compile each source file
###
compile = (source, template, output, packge, mangle, whitespace) ->

    ## Initialize the metadata ##
    if packge
        if not fs.existsSync("./dish.json")
            fs.writeFileSync "./dish.json", """
            {
                "#{packge}": {}
            }
            """
        api = require("../dish.json")

    ###
     * Phase I
     *
     *  collect type information and build the ast  
     *
    ###
    parsed = parser.parse(lexer(fs.readFileSync(source, 'utf8')), mangle, packge)
    ###
    * Update package metadata
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

    ###
     * Phase II
     *
     *  transform ast by refactoring expressions 
     *
    ###
    code = transform.code(packge, parsed.name, parsed.ast)

    ###
     * Phase III
     *
     * set up the enviromment and linkages
     *
    ###
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

    ###
    * Fixups for name mangling
    ###
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


    if output then fs.writeFileSync "#{output}/#{path.basename(source, '.d')}.js", out
    console.log "dish #{manifest.version} #{packge||''}  #{source}"


main()