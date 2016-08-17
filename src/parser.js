/**
 * parse.js - no tca version
 * 
 * 
 * Recursive Descent Parser for D`ish
 * Parses the statements and builds linkage infrastructure 
 * expression parsing is handed off to parseExp.
 * 
 * - Blit Twiddlefast
 */
'use strict'

module.exports = {
    parse: parse
}


/**
 * Parse tokens from the input lexer
 * 
 * @param input lexer
 * @returns parsed document and flags
 */
function parse(input, mangle, packge) {
    const jsep = require('jsep')
    const codegen = require('escodegen')
    const esprima = require('esprima')
    const Ast = require('./classes/Ast')
    const Field = require('./classes/Field')
    const Symbol = require('./classes/Symbol')
    const Term = require('./classes/Term')
    const Token = require('./classes/Token')
    const Triad = require('./classes/Triad')
    const factory = require('./factory')
    const lexer = require('./lexer')
    const ast = { type: 'Program', body: [] }
    const ctor = {args:[], body:[]}
    const symtbl = { global: {} }
    const exporting = {}
    const types = {}
    const api = {}
    const data = []
    const mem = {
        byte:   {size: 0, width: 1, heap: 'HEAPU8',   name: 'HEAPU8'},
        char:   {size: 1, width: 2, heap: 'HEAPI16',  name: 'HEAPI16'},
        bool:   {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPI32'},
        int:    {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPI32'},
        uint:   {size: 2, width: 4, heap: 'HEAPU32',  name: 'HEAPU32'},
        object: {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPU32'},
        float:  {size: 2, width: 4, heap: 'HEAPF32',  name: 'HEAPF32'},
        double: {size: 3, width: 8, heap: 'HEAPF64',  name: 'HEAPF64'}
    }
    const heaps = {
        HEAPI8: false,
        HRAPU8: false,
        HEAPI16: false,
        HEAPU16: false,
        HEAPI32: false,
        HEAPU32: false,
        HEAPF32: false,
        HEAPF64: false
    }

    let uniqueId = 1
    let moduleName = ''
    let current = ''
    let block = [] // current output block
    let currentScope = ''
    let imtype = ''
    let priorScope = ''
    let injectInit = false
    let isClass = false
    let isPublic = false
    let isStatic = false
    let isConst = false
    let float = false
    let malloc = false
    Field.offset = 0
    Field.index = 0
    Field.size = 0
    Field.last = 0

    try {

        /** It's either a module or a class */
        if (matchKeyword('module')) {
            parseModule(ast.body)
        } else if (matchKeyword('class')) {
            isClass = true
            parseClass(ast.body)
        }


        return {
            ast: ast,           //  main code body ast
            name: moduleName,   //  module name
            float: float,       //  uses floats?
            malloc: malloc,     //  use heap?
            heapi8: heaps.HEAPI8,     //  heap views:
            heapu8: heaps.HEAPU8,
            heapi16: heaps.HEAPI16,
            heapu16: heaps.HEAPU16,
            heapi32: heaps.HEAPI32,
            heapu32: heaps.HEAPU32,
            heapf32: heaps.HEAPF32,
            heapf64: heaps.HEAPF64,
            exports: exporting,  //  exported API
            api: api,
            data: data,
            size: Field.last,
            'class': isClass,
            symtbl: symtbl
        }
        
    } catch (ex) {
        console.log(ex.message)
        console.log(ex.stack)
        process.exit(0)
    }


    function match(ch) {
        return input.match(ch)
    }
    function matchKeyword(kw) {
        return input.matchKeyword(kw)
    }
    function expect(ch) {
        return input.expect(ch)
    }
    function expectKeyword(kw) {
        return input.expectKeyword(kw)
    }

    function reset() {
        uniqueId = 1
    }

    function parseModule(body) {
        expectKeyword('module') //  first keyword is required
        moduleName = input.next().value
        expect(';')

        while (!input.eof()) {
            let node = parseGlobal(body)
            if (node) body.push(node)
            if (!input.eof()) if (match(';')) expect(';')
        }
    }

    function parseClass(body) {
        expectKeyword('class') //  first keyword is required
        moduleName = input.next().value
        expect('{')
        while (!input.eof()) {
            isPublic = true
            isStatic = false
            isConst = false
            let node = parseGlobal(body)
            if (node) body.push(node)
            if (!input.eof()) if (match(';')) expect(';')
            if (match('}')) break
        }
        expect('}')
        /**
         * constructor
         */
        exporting.ctor = 'ctor'
        const api = require('../dish.json')
        const size = api[packge][moduleName].size
        const params = [jsep('self|0')]
        for (let i=0; i<ctor.args.length; i++) {
            switch (ctor.args[i].type.value) {
                case 'float': 
                    float = true
                    params.push(jsep(`fround(${ctor.args[i].name.value})`))
                    break
                case 'double':
                    params.push(jsep(`+${ctor.args[i].name.value}`))
                    break
                default:
                    params.push(jsep(`${ctor.args[i].name.value}|0`))

            }
        }

        malloc = true
        ctor.body.push(factory.IntDeclaration('self'))
        ctor.body.push(factory.New('self', { "type": "Literal", "value": size }))
        ctor.body.push(factory.CallExpression(moduleName, params))
        ctor.body.push(factory.Return(jsep('self|0')))
        body.push(factory.FunctionDeclaration({value:'ctor'}, ctor.args, ctor.body))
    }

    /**
     * Parse Global Scope
     * 
     * No executable code in the global scope
     * Only declarative statements, imports and exports:
     * 
     * import
     * export
     * int
     * uint
     * float
     * double
     */
    function parseGlobal(body) {
        //=================================
        if (matchKeyword('bool'))       return parseBool()
        if (matchKeyword('const'))      return parseConst()
        if (matchKeyword('double'))     return parseDouble()
        if (matchKeyword('export'))     return parseExport('export')
        if (matchKeyword('public'))     return parseExport('public')
        if (matchKeyword('private'))    return parsePrivate()
        if (matchKeyword('float'))      return parseFloat32()
        if (matchKeyword('import'))     return parseImport(body)
        if (matchKeyword('extern'))     return parseExtern(body)
        if (matchKeyword('uint'))       return parseUint32()
        if (matchKeyword('int'))        return parseInt32()
        if (matchKeyword('void'))       return parseVoid()
        if (matchKeyword('static'))     return parseStatic()
        if (types[input.peek().value])  return parseType()
        //=================================
        input.raise('Unexpected token: ')
    }


    /**
     * Parse Procedure Scope
     * 
     * Everything except import, export, function can be
     * defined in procedure scope. 
     */
    function parseStatement(body) {
        //=================================
        if (matchKeyword('bool'))       return parseBool(currentScope)
        if (matchKeyword('const'))      return parseConst(currentScope)
        if (matchKeyword('double'))     return parseDouble(currentScope)
        if (matchKeyword('float'))      return parseFloat32(currentScope)
        if (matchKeyword('int'))        return parseInt32(currentScope)
        if (matchKeyword('uint'))       return parseUint32(currentScope)
        if (matchKeyword('void'))       return parseVoid(currentScope)
        if (types[input.peek().value])  return parseType(currentScope)
        //=================================
        if (currentScope !== priorScope) {
            reset()
            priorScope = currentScope
            for (let name in symtbl[currentScope]) {
                let sym = symtbl[currentScope][name]
                if (sym.init) {
                    if (sym.array) {
                        malloc = true
                        const tokens = tokens2Array(sym.init)
                        body.push(factory.New(name, { "type": "Literal", "value": tokens.length }))
                        for (let t in tokens) {
                            let sname = `${sym.heap}[(${name}+${t})<<2>>2]`
                            let value = parseExp(''+tokens[t])
                            body.push(factory.AssignmentStatement(sname, value))
                        }
                    } else {
                        body.push(factory.AssignmentStatement(sym.name, parseExp(sym.init.join(' '))))
                    }
                }
            }
        }
        //=================================
        if (matchKeyword('break'))      return parseBreak()
        if (matchKeyword('continue'))   return parseContinue()
        if (matchKeyword('do'))         return parseDo()
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parseIf()
        if (matchKeyword('print'))      return parsePrinturn(body)
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()
        //=================================
       return parseExpression(body)
 
    }    
    
    function parseExpression(body) {

        const lhs = []
        const rhs = []
        const isReturn = matchKeyword('return')

        if (isReturn) {
            expectKeyword('return')
            if (match(';')) return factory.Return()
            
        }

        while (!match('=') && !match(';')) {
            lhs.push(input.next().value)
        }
        if (match('=')) {
            if (isReturn) input.raise('Invalid return/assignment')
            expect('=')
            while (!match(';')) {
                rhs.push(input.next().value)
            }
        }

        if (rhs.length === 0) {
            return parseEx0(null, lhs, isReturn)
        } else {
            return parseEx0(lhs, rhs, false)
        }

    }


    function parseEx0(lhs, rhs, isReturn) {

        imtype = ''
        try {
            if (isReturn) {
                const api = require('../dish.json')
                imtype = api[packge][moduleName].symtbl.global[currentScope].type
                return factory.Return(jsep(recode(rhs)))
            } else if (lhs == null) {
                return esprima.parse(recode(rhs)).body[0]
            } else {
                return esprima.parse(`${recode(lhs, true)} = ${recode(rhs)}`).body[0]
            }
        } catch (ex) {
            console.log(ex.stack)
            process.exit(0)
        }
    }

    /**
     * recode
     * 
     * @param tokens parsed input expression
     * @param isLhs if true, set the implied type for the rhs
     * @returns string re-written code
     */
    function recode(tokens, isLhs) {
        for (let t in tokens) {
            switch (tokens[t]) {
                case 'true': tokens[t] = 1;break
                case 'false': tokens[t] = 0;break
            }
        }
        if (tokens[0] === 'new') {
            malloc = true
            if (mem[tokens[1]]) {
                const exp = []
                let bracket = 0
                let i = 2
                do {
                    if (tokens[i] === '[') bracket++
                    if (tokens[i] === ']') bracket--
                    exp.push(tokens[i++])
                } while (bracket !== 0)
                exp[0] = '('
                exp[exp.length-1] = ')'
                
                heaps[mem[tokens[1]].name] = true
                return `malloc(${exp.join(' ')} << ${mem[tokens[1]].size})|0`
            }
            const exp = []
            const par = []
            let paren = 0
            let i = 2
            let p = 0
            do {
                if (tokens[i] === '(') paren++, i++
                else if (tokens[i] === ')') paren--, i++
                else if (tokens[i] === ',') i++, p++
                else {
                    if (!par[p]) par[p] = []
                    par[p].push(tokens[i++])
                }
            } while (paren !== 0)

            const api = require('../dish.json')
            const def = api[packge][tokens[1]].api['ctor']
            let param = []
            for (let k in def) {
                param.push(def[k])
            }
            for (p in par) {
                switch (param[p]) {
                    case 'float':   exp.push(`fround(${par[p].join(' ')})`); break;
                    case 'double':  exp.push(`+(${par[p].join(' ')})`); break;
                    default:        exp.push(`${par[p].join(' ')}|0`); break
                }
            }
            heaps.HEAPI32 = true
            return `${tokens[1]}_ctor(${exp.join(',')})|0`

        }
        const sym = symtbl[currentScope][tokens[0]]

        if (tokens[1] === '.') {
            /**
             * name.member
             * name.member(..)
             * name.member[index]
             */

            if (tokens[3] === '[') {
                const def = lookupField(sym.type, tokens[2])
                const exp = []
                let bracket = 0
                let i = 3
                do {
                    if (tokens[i] === '[') bracket++
                    if (tokens[i] === ']') bracket--
                    exp.push(tokens[i++])
                } while (bracket !== 0)
                exp[0] = '('
                exp[exp.length-1] = ')'
                heaps[mem[def.type].heap] = true

                const out = `${mem[def.type].heap}[${tokens[0]}+${def.offset}+(${exp.join(' ')} << ${mem[def.type].size}) >> ${mem[def.type].size}]`
                if (isLhs) {
                    imtype = def.type
                    return out
                } else switch (imtype) {
                    case 'float':   return `fround(${out})` 
                    case 'double':  return `+(${out})` 
                    default:        return `${out}|0` 
                }                

            } else if (tokens[3] === '(') {
                const exp = []
                const par = []
                let paren = 0
                let i = 3
                let p = 0
                do {
                    if (tokens[i] === '(') paren++, i++
                    else if (tokens[i] === ')') paren--, i++
                    else if (tokens[i] === ',') i++, p++
                    else {
                        if (!par[p]) par[p] = []
                        par[p].push(tokens[i++])
                    }
                } while (paren !== 0)

                const api = require('../dish.json')
                const def = api[packge][symtbl[currentScope][tokens[0]].type].api[tokens[2]]
                let param = []
                for (let k in def) {
                    param.push(def[k])
                }
                param.shift()

                for (p in par) {
                    switch (param[p].type) {
                        case 'float':   exp.push(`fround(${par[p].join(' ')})`); break;
                        case 'double':  exp.push(`+(${par[p].join(' ')})`); break;
                        default:        exp.push(`${par[p].join(' ')}|0`); break
                    }
                }
                // for (p in par) {
                //     /** TODO: get correct type for coercion */
                //     exp.push(par[p].join(' '))
                // }
                exp.unshift(`${tokens[0]}|0`)

                const out = `${symtbl[currentScope][tokens[0]].type}_${tokens[2]}(${exp.join(',')})`
                if (isLhs) {
                    const api = require('../dish.json')
                    const t = api[packge][symtbl[currentScope][tokens[0]].type]
                    imtype = t.symtbl.global[tokens[2]].type
                    return out
                } else {
                    switch (imtype) {
                        case 'float':   return `fround(${out})` 
                        case 'double':  return `+(${out})` 
                        default:        return `${out}|0` 
                    }                
                }
            } else {
                const def = lookupField(sym.type, tokens[2])
                heaps[mem[def.type].heap] = true
                const out = `${mem[def.type].heap}[${tokens[0]}+${def.offset} >> ${mem[def.type].size}]`
                if (isLhs) {
                    imtype = def.type
                    return out 
                } else switch (imtype) {
                    case 'float':   return `fround(${out})` 
                    case 'double':  return `+(${out})` 
                    default:        return `${out}|0` 
                }                
                return out
            }
            
        } else if (tokens[1] === '[') {
            /**
             * name[index]
             */
            const exp = []
            let bracket = 0
            let i = 1
            do {
                if (tokens[i] === '[') bracket++
                if (tokens[i] === ']') bracket--
                exp.push(tokens[i++])
            } while (bracket !== 0)
            exp[0] = '('
            exp[exp.length-1] = ')'
            heaps[mem[def.type].heap] = true
            const out = `${mem[def.type].heap}[${tokens[0]}+${exp.join(' ')}*${mem[def.type].width} >> mem[def.type].size]`
            if (isLhs) {
                imtype = def.type
                return out 
            } else switch (imtype) {
                case 'float':   return `fround(${out})` 
                case 'double':  return `+(${out})` 
                default:        return `${out}|0` 
            }                

        } else if (tokens[1] === '(') {
            /**
             * name(...)
             */
            const exp = []
            const par = []
            let paren = 0
            let i = 1
            let p = 0
            do {
                if (tokens[i] === '(') paren++, i++
                else if (tokens[i] === ')') paren--, i++
                else if (tokens[i] === ',') i++, p++
                else {
                    if (!par[p]) par[p] = []
                    par[p].push(tokens[i++])
                }
            } while (paren !== 0)

            const api = require('../dish.json')
            const def = symtbl[currentScope]
            let param = []
            for (let k in def) {
                param.push(def[k])
            }
            param.shift()

            for (p in par) {
                switch (param[p].type) {
                    case 'float':   exp.push(`fround(${par[p].join(' ')})`); break;
                    case 'double':  exp.push(`+(${par[p].join(' ')})`); break;
                    default:        exp.push(`${par[p].join(' ')}|0`); break
                }
            }

            // for (p in par) {
            //     /** TODO: get correct type for coercion */
            //     exp.push(par[p].join(' ')+'|0')
            // }
            //currentScope
            const out = `${tokens[0]}(${exp.join(',')})`
            if (isLhs) {
                const api = require('../dish.json')
                imtype = def.type
                return out
            } else {
                switch (imtype) {
                    case 'float':   return `fround(${out})` 
                    case 'double':  return `+(${out})` 
                    default:        return `${out}|0` 
                }                
            }

        }


        const out = tokens.join(' ')
        if (isLhs) {
            return out 
        } else switch (imtype) {
            case 'float':   return `fround(${out})` 
            case 'double':  return `+(${out})` 
            default:        return `${out}|0` 
        }                
        
    }

    function lookupField(type, name) {
        let t = null
        if (type === moduleName) {
            t = data
        } else {
            const ext = require('../dish.json')
            try {
                t = ext[packge][name].data
            } catch (ex) {
                input.raise(`Unable to lookupField ${packge} ${name} `)
            }
        }
        for (let i in t) {
            if (t[i].name === name) return t[i]
        }
        input.raise(`Type ${type} not found`)

    }

    function fixExpression(tokens) {
        const exp = []

        for (let i in tokens) {

            switch(tokens[i]) {
                case 'to!double':
                    tokens[i].value = '__double__'
                    break
                case 'to!int':
                    tokens[i].value = '__int__'
                    break
                case 'to!float':
                    tokens[i].value = 'fround'
                    float = true
                    break
            }
            
            exp.push(tokens[i].value)
        }
        return exp.join(' ')
    }

    /**
     * Constant 
     */
    function parseConst(scope) {

        expectKeyword('const')
        isConst = true
        if (matchKeyword('double'))     return parseDouble(scope)
        if (matchKeyword('float'))      return parseFloat32(scope)
        if (matchKeyword('bool'))       return parseBool(scope)
        if (matchKeyword('int'))        return parseInt32(scope)
        if (matchKeyword('uint'))       return parseUint32(scope)
        input.raise('Unexpected token: ')
    }
    
    function parseStatic(scope) {

        expectKeyword('static')
        isStatic = true
        if (matchKeyword('const'))      return parseConst()
        if (matchKeyword('double'))     return parseDouble(scope)
        if (matchKeyword('float'))      return parseFloat32(scope)
        if (matchKeyword('bool'))       return parseBool(scope)
        if (matchKeyword('int'))        return parseInt32(scope)
        if (matchKeyword('uint'))       return parseUint32(scope)
        input.raise('Unexpected token: ')
    }

    function parsePrivate() {
        expectKeyword('private')
        isPublic = false
        if (matchKeyword('static'))     return parseStatic()
        if (matchKeyword('const'))      return parseConst()
        if (matchKeyword('double'))     return parseDouble()
        if (matchKeyword('float'))      return parseFloat32()
        if (matchKeyword('bool'))       return parseBool()
        if (matchKeyword('int'))        return parseInt32()
        if (matchKeyword('uint'))       return parseUint32()
        input.raise('Unexpected token: ')
    }


    /**
     * Parse an expression 
     * 
     * A wrapper around jsep
     * converts ++ syntax in for update expression
     * 
     * @param tokens the expression as string or as an array of tokens
     * @param conditional bool hint conditional or arithmetic
     * @returns esprima schema ast
     */
    function parseExp(tokens, conditional) {
        if ('string' === typeof tokens) {
            try {
                return jsep(tokens)
            } catch (ex) {
                console.log(tokens)
                console.log(ex.message)
                console.log(ex.stack)
                process.exit(0)
            }
        } else {
            if (conditional) {
                // coerce each term individually
                const scope = currentScope === '' ? 'global' : currentScope
                const temp = []
                for (let i=0; i<tokens.length; i++) {
                    const token = tokens[i]
                    if (token.type === Token.Variable) {
                        if (!symtbl[scope][token.value])  {
                            temp.push(token)
                            continue // todo?: finish this
                        }
                        switch(symtbl[scope][token.value].type) {
                            case 'int':    
                            case 'uint':    
                            case 'bool':
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, '|'))
                                temp.push(new Token(Token.Number, '0'))
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                            case 'double':  
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(new Token(Token.Delimiter, '+'))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                            case 'float':   
                                temp.push(new Token(Token.Variable, 'fround'))
                                temp.push(new Token(Token.Delimiter, '('))
                                temp.push(token)
                                temp.push(new Token(Token.Delimiter, ')'))
                                break
                            default:
                                console.log('WTF 303')
                                process.exit(0)
                        }
                    } else {
                        temp.push(token)
                    }
                }
                const str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep(str.join(' '))
            } else if (tokens.length === 2 && tokens[0].type === Token.Variable && tokens[1].value === '++')  {
                const temp = []
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '='))
                temp.push(new Token(Token.Delimiter, '('))
                temp.push(tokens[0])
                temp.push(new Token(Token.Delimiter, '+'))
                temp.push(new Token(Token.Number, '1'))
                temp.push(new Token(Token.Delimiter, ')'))
                temp.push(new Token(Token.Delimiter, '|'))
                temp.push(new Token(Token.Number, '0'))
                const str = []
                for (let i=0; i<temp.length; i++) {
                    str.push(temp[i].value)
                }
                return jsep(str.join(' '))
            }
            else {
                const str = []
                for (let i=0; i<tokens.length; i++) {
                    str.push(tokens[i].value)
                }
                return jsep(str.join(' '))
            }
        }
    }

    function parseFunction(scope, type, name) {
        if (scope !== 'global')  {
            input.raise('Unsupported: nested functions')
        }
        if (symtbl[name.value] == null) {
            symtbl[name.value] = {}
        } else {
            input.raise(`Function ${name.value} already defined.`)
        }
        currentScope = name.value
        api[currentScope] = {}
        
        const isCtor = (currentScope === moduleName)

        const args = []
        if (isClass) {
            api[currentScope]['self'] = 'self'
            args.push({type: new Token(Token.Variable, moduleName), name: new Token(Token.Variable, 'self')})
        }
        expect('(')
        while (!match(')')) {
            const apiType = input.next()
            const apiName = input.next()
            api[currentScope][apiName.value] = apiType.value
            args.push({ type: apiType, name: apiName})
            if (isCtor) {
                ctor.args.push({ type: apiType, name: apiName})
                api['ctor'] = api['ctor'] || {}
                api['ctor'][apiName.value] = apiType.value
            }
            if (match(',')) input.next()
        }
        expect(')')

        const body = block = []

        for (let i=0; i<args.length; i++) {
            const size = args[i].type.value === 'double' ? 3 : 2;
            symtbl[name.value][args[i].name.value] = new Symbol(args[i].name.value, args[i].type.value)
            switch(args[i].type.value) {
                case 'bool':    
                    body.push(factory.IntParameter(args[i].name))
                    if (isCtor && i>0)
                        ctor.body.push(factory.IntParameter(args[i].name))
                    break
                case 'uint':    
                    body.push(factory.IntParameter(args[i].name))
                    if (isCtor && i>0)
                        ctor.body.push(factory.IntParameter(args[i].name))
                    break
                case 'int':     
                    body.push(factory.IntParameter(args[i].name))
                    if (isCtor && i>0)
                        ctor.body.push(factory.IntParameter(args[i].name))
                    break
                case 'float':   
                    body.push(factory.FloatParameter(args[i].name))
                    if (isCtor && i>0)
                        ctor.body.push(factory.FloatParameter(args[i].name))
                    break
                case 'double':  
                    body.push(factory.DoubleParameter(args[i].name))
                    if (isCtor && i>0)
                        ctor.body.push(factory.DoubleParameter(args[i].name))
                    break
                default: 
                    if (types[args[i].type.value]) {
                        body.push(factory.IntParameter(args[i].name))
                        if (isCtor && i>0)
                            ctor.body.push(factory.IntParameter(args[i].name))
                        break
                    } else if (args[i].type.value === moduleName) {
                        body.push(factory.IntParameter(args[i].name))
                        if (isCtor && i>0)
                            ctor.body.push(factory.IntParameter(args[i].name))
                        break
                    } else input.raise('Parameter type not found')        
            }
        }

        expect('{')
        while (!match('}')) {
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        return factory.FunctionDeclaration(name, args, body)
    }

    function parseCall() {
        let name = input.next();
        const arg = []
        let pos = 0
        expect('(')
        while (!match(')')) {
            if (match(',')) {
                expect(',')
                pos++
            } else {
                if (!arg[pos]) arg[pos] = []
                arg[pos].push(input.next())
            }

        }
        expect(')')
        const params = []
        for (let i=0; i<arg.length; i++) {
            //TODO: Coerce params - p1|0, +p2, fround(p3)
            let node = parseExp(arg[i])
            params.push(node)
        }
        return factory.CallExpression(name.value, params)
    }


    /**
     * Create Variable
     * 
     * @param body block to create variable in
     * @param name name of the variable
     * @param type type of the variable
     * @param value value of the variable
     */
    function createVar(body, name, type, value) {
        if (name.substr(0,(mangle?1:2)) !== (mangle?'$':'__')) return
        if (!symtbl[currentScope][name]) {
            symtbl[currentScope][name] = new Symbol(name, type)
            if (name === (mangle?'$01':'__01__') && block.vars.declarations[0].id.name === (mangle?'$ZZ':'__ZZ__')) { 
                block.vars.declarations[0] = {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": name
                    },
                    "init": {
                        "type": "Literal",
                        "value": value,
                        "raw": String(value)
                    }
                }
                return
            }
            block.vars.declarations.push({
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": {
                    "type": "Literal",
                    "value": value,
                    "raw": String(value)
                }
            })
        }
    }
    /**
     * returns a sequence of AssignmentExpressions
     * used in for loop header
     * 
     */
    function parseForAssignment() {
        const names = []
        const inits = []
        let name = ''
        let tokens = []
        while (!match(';') && !match(')')) {
            if (name === '') { /* next token MUST be the lhs, therefore it's the name */
                if (input.peek().type === Token.Variable) {
                    name = input.next().value
                    tokens = []
                } else {
                    input.raise('Expecting lhs variable')
                }
            } else if (match('=')) { /** eat the equal operator */
                expect('=')
            } else if (match('++')) { /** expand the ++ operator */
                expect('++') 
                tokens.push('(')
                tokens.push(name)
                tokens.push('+')
                tokens.push('1')
                tokens.push(')')
                tokens.push('|')
                tokens.push('0')
            } else if (match(',')) { /** a sequence of assignments */
                expect(',')
                names.push(name)
                inits.push(parseExp(tokens.join(' ')))
                name = ''
            } else { /** just copy the token to the output stack */
                tokens.push(input.next().value)
            }
        }
        names.push(name)
        inits.push(parseExp(tokens.join(' ')))
        if (names.length === 1) {
            return factory.AssignmentStatement(names[0], parseExp(tokens.join(' ')))
        } else {
            return factory.AssignmentStatement(names, inits)
        }
        
    }

    function parseBool(scope) {
        scope = scope || 'global'
        let isArray = false
        let alloc = 1
        expectKeyword('bool')
        if (match('[')) {
            expect('[')
            if (input.peek().type === Token.Number) {
                alloc = input.next().value
            }
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (match('(')) {   /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'bool', true)
            return parseFunction(scope, 'bool', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                let b = input.next().value
                switch (b) {
                    case 'true': tokens.push('1'); break 
                    case 'false': tokens.push('0'); break
                    default: tokens.push(b)
                }
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'bool', false, tokens, isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseInt(tokens.join(''), 10),
                    "raw":      parseInt(tokens.join(''), 10)
                })
            } else  {
                return factory.IntDeclaration(name.value) 
            }

        } else { /** Field? */
            if (isClass && scope === 'global') {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'bool', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'bool', false, '', isArray)
                return factory.IntDeclaration(name.value)
            }
        }
    }

    function parseBreak() {
        expectKeyword('break')
        factory.BreakStatement()
    }
    function parseContinue() {
        expectKeyword('continue')
        factory.ContinueStatement()
    }
    function parseDo() {
        expectKeyword('do')

        const body = []
        expect('{')
        while (!match('}')) {
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')

        expectKeyword('while')
        expect('(')
        const tokens = []
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')

        return factory.DoWhileStatement(parseExp(tokens, true), body)
        
    }
    function parseDouble(scope) {
        scope = scope || 'global'
        let isArray = false
        let alloc = 1
        expectKeyword('double')
        if (match('[')) {
            expect('[')
            if (input.peek().type === Token.Number) {
                alloc = input.next().value
            }
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (match('(')) { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'double', true)
            return parseFunction(scope, 'double', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'double', false, tokens, isArray)
            if (scope === 'global') {
                return factory.DoubleDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseFloat(tokens.join('')),
                    "raw":      parseFloat(tokens.join(''))
                })
            } else  {
                return factory.DoubleDeclaration(name.value) 
            }

        } else {
            if (isClass && scope === 'global') {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'double', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'double', false, '', isArray)
                return factory.DoubleDeclaration(name.value)
            }
        }
    }

    function parseExport(which) {
        expectKeyword(which)
        isPublic = true
        if (matchKeyword('void')) {
            expectKeyword('void')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseVoid()
        }
        if (matchKeyword('int')) {
            expectKeyword('int')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseInt32()
        }
        if (matchKeyword('bool')) {
            expectKeyword('bool')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseBool()
        }
        if (matchKeyword('uint')) {
            expectKeyword('uint')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseUint32()
        }
        if (matchKeyword('double')) {
            expectKeyword('double')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseDouble()
        }
        if (matchKeyword('float')) {
            expectKeyword('float')
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseFloat32()
        }
        if (types[input.peek().value]) {
            input.next()
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseType()
        }
        if (input.peek().value === moduleName) {
            input.next()
            const name = input.peek()
            exporting[name.value] = name.value
            input.putBack()
            return parseType()
        }
        input.raise(`Export/Public (${which}) type not found: `)
    }

    function parseFloat32(scope) {
        scope = scope || 'global'
        let isArray = false
        let alloc = 1
        expectKeyword('float')
        if (match('[')) {
            expect('[')
            if (input.peek().type === Token.Number) {
                alloc = input.next().value
            }
            expect(']')
            isArray = true
            malloc = true
            heapi32 = true
        }
        const name = input.next()
        if (match('(')) { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'float', true)
            return parseFunction(scope, 'float', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            //TODO:Double and Float, also 
            symtbl[scope][name.value] = new Symbol(name.value, 'float', false, tokens, isArray)
            if (scope === 'global') {
                return factory.FloatDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseFloat(tokens.join('')),
                    "raw":      parseFloat(tokens.join(''))
                })
            } else  {
                return factory.FloatDeclaration(name.value) 
            }

        } else {
            if (isClass && scope === 'global') {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'float', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'float', false, '', isArray)
                return factory.FloatDeclaration(name.value)
            }
        }
    }

    function parseFor() {
        const init = []
        const tokens = []
        const update = []
        const body = []
        expectKeyword('for')
        expect('(')

        while (!match(';')) { // Initialize
            init.push(parseForAssignment())
        }
        expect(';')
        while (!match(';')) { // Test
            tokens.push(input.next())
        }
        expect(';')
        while (!match(')')) { // Update
            update.push(parseForAssignment())
        }
        expect(')')
        expect('{')
        while (!match('}')) { // Block
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')

        const _init = init.length>0?init[0].expression:null
        const _update = update.length>0?update[0].expression:null

        return factory.ForStatement(_init, parseExp(tokens, true), _update, body)
        
    }

    function parseInt32(scope) {
        scope = scope || 'global'
        let isArray = false
        let alloc = 1
        expectKeyword('int')
        if (match('[')) {
            expect('[')
            if (input.peek().type === Token.Number) {
                alloc = input.next().value
            }
            expect(']')
            isArray = true
            malloc = true
            heaps.HEAPI32 = true
        }
        const name = input.next()
        if (match('(')) {   /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'int', true)
            return parseFunction(scope, 'int', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'int', false, tokens, isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseInt(tokens.join(''), 10),
                    "raw":      parseInt(tokens.join(''), 10)
                })
            } else  {
                return factory.IntDeclaration(name.value) 
            }

        } else { /** Field? */
            if (isClass && scope === 'global') {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'int', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'int', false, '', isArray)
                return factory.IntDeclaration(name.value)
            }
        }
    }

    function parseIf() {
        expectKeyword('if')
        let paren = 0
        let tokens = []
        do {
            if (match('(')) paren++
            if (match(')')) paren--
            tokens.push(input.next())
        } while (paren !== 0)
        const consequent = []
        expect('{')
        while (!match('}')) {
            consequent.push(parseStatement(consequent))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        const alternate = []
        if (matchKeyword('else')) {
            expectKeyword('else')
            expect('{')
            while (!match('}')) {
                alternate.push(parseStatement(alternate))
                if (!input.eof()) if (match(';')) expect(';')
            }
            expect('}')
        }

        const _then = consequent.length === 0 ? null :  { "type": "BlockStatement", "body": consequent }
        const _else = alternate.length === 0 ? null : { "type": "BlockStatement", "body": alternate }

        let c = factory.IfStatement(parseExp(tokens, false), _then, _else)
        return c;
    }

    /**
     * import class from another asm.js class module
     * 
     * import class = package.class;
     * 
     * 
     */
    function parseImport(body) {
        expectKeyword('import')
        const name = input.next()
        if (match('=')) {
            expect('=')
            const pname = input.next().value
            expect('.')
            const mname = input.next().value
            const api = require('../dish.json')
            types[mname] = mname
            for (let aname in api[pname][mname].api) {
                body.push(factory.ImportDeclaration(`${mname}_${aname}`, 'foreign', `${mname}_${aname}`))
            }
        } else {
            return factory.ImportDeclaration(name.value, 'foreign', name.value)
        }
    }

    /**
     * declare external javascript function:
     * 
     * 
     * extern EntityIsNotEnabledException;
     * extern entity.create;
     * extern Math.log
     * 
     */
    function parseExtern(body) {
        expectKeyword('extern')
        const name = input.next()
        if (match('.')) {
            expect('.')
            let method = input.next()
            if (name.value === 'Math') {
                return factory.ImportDeclaration(method.value, 'stdlib', name.value, method.value)
            } else {
                types[name.value] = name.value
                return factory.ImportDeclaration(`${name.value}_${method.value}`, 'foreign', `${name.value}_${method.value}`)
            }
        } else {
            return factory.ImportDeclaration(name.value, 'foreign', name.value)
        }
    }
    /**
     * Method
     * 
     */
    function parseMethod() {
        const _this = input.next()
        expect('.')
        const name = input.next()

        let sym = symtbl[currentScope][_this.value]
        name.value = `${sym.type}_${name.value}`
        const arg = [[
            _this,
            new Token(Token.Delimiter, '|'),
            new Token(Token.Number, '0')
        ]]
        let pos = 1
        if (match('(')) {
            /**
             * Method Call:
             * 
             *      entity.setComponent(index|0, component|0);
             */
            expect('(')
            while (!match(')')) {
                if (match(',')) {
                    expect(',')
                    pos++
                } else {
                    if (!arg[pos]) arg[pos] = []
                    arg[pos].push(input.next())
                }

            }
            expect(')')
            const params = []
            for (let i=0; i<arg.length; i++) {
                //TODO: Coerce params - p1|0, +p2, fround(p3)
                let node = parseExp(arg[i])
                params.push(node)
            }
            return factory.CallExpression(name.value, params)
        } else if (match('[')) {
            /**
             * Property Array
             *         
             *      self.component[index] = value;
             */
            expect('[')
            const tokens = []
            while (!match(']')) {
                tokens.push(input.next().value)
            }
            expect(']')

        } else input.raise('Invalid property/method')
    }
    /**
     * Print statement - wrapper for console.log
     * 
     * do not use in production:
     *this construct will disable aot compilation
     * 
     */
    function parsePrint() {
        const args = []
        expectKeyword('print')
        expect('(')
        while (!match(')')) {
            let arg = input.next()
            switch(arg.type) {
                case Token.String: /** this is the only place where strings are allowed. */
                case Token.Number:
                    args.push({ type: 'Literal', value: arg.value, raw: `"${arg.value}"` })
                    break
                case Token.Variable:
                    args.push({ type: 'Identifier', name: arg.value })
                    break
            }
        }
        expect(')')
        return factory.Print(args)
    }

    function parseSwitch() {
        expectKeyword('switch')
        expect('(')
        const tokens = []
        const cases = []
        const this_case = null;
        while (!match(')')) {
            tokens.push(input.next())
        }
        expect(')')
        expect('{')
        while (!match('}')) {
            while (matchKeyword('case')) {
                expectKeyword('case')
                this_case = []
                cases.push(this_case)
                while (!matchKeyword('break')) {
                    this_case.push(parseStatement())
                    if (!input.eof()) if (match(';')) expect(';')
                }
                expectKeyword('break')
                this_case.push(factory.BreakStatement())
            }
        }
        expect('}')
        return factory.SwitchStatement(parseExp(tokens), cases)
    }

    function parseType(scope) {
        scope = scope || 'global'
        let isArray = false
        let klass = input.next()
        if (match('[')) {
            expect('[')
            expect(']')
            isArray = true
            malloc = true
            heaps.HEAPI32 = true
        }
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, klass.value, true)
            return parseFunction(scope, klass.value, name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = new Symbol(name.value, klass.value, false, tokens, isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseInt(tokens.join(''), 10),
                    "raw":      parseInt(tokens.join(''), 10)
                })
            } else  {
                return factory.IntDeclaration(name.value) 
            }

        } else {
            symtbl[scope][name.value] = new Symbol(name.value, klass.value, false, '', isArray)
            return factory.IntDeclaration(name.value)
        }
    }


    function parseUint32(scope) {
        scope = scope || 'global'
        let isArray = false
        let alloc = 1
        expectKeyword('uint')
        if (match('[')) {
            expect('[')
            if (input.peek().type === Token.Number) {
                alloc = input.next().value
            }
            expect(']')
            isArray = true
            malloc = true
            heaps.heapui32 = true
        }
        const name = input.next()
        if (match('(')) { /** function definition */
            if (isArray) {
                input.raise('Syntax Error: array found')
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'uint', true)
            return parseFunction(scope, 'uint', name)

        } else if (match('=')) { /** initialization */
            expect('=')
            let tokens = []
            while (!match(';')) {
                tokens.push(input.next().value)
            }
            symtbl[scope][name.value] = new Symbol(name.value, 'uint', false, tokens, isArray)
            if (scope === 'global') {
                return factory.IntDeclaration(name.value, {
                    "type":     "Literal",
                    "value":    parseInt(tokens.join(''), 10),
                    "raw":      parseInt(tokens.join(''), 10)
                })
            } else  {
                return factory.IntDeclaration(name.value) 
            }

        } else {
            if (isClass && scope === 'global') {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'uint', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'uint', false, '', isArray)
                return factory.IntDeclaration(name.value)
            }
        }
    }

    function parseVoid(scope) {
        scope = scope || 'global'
        expectKeyword('void')
        const name = input.next()
        if (input.peek().value === '(') { /** function definition */
            symtbl[scope][name.value] = new Symbol(name.value, 'void', true)
            return parseFunction(scope, 'void', name)

        } else {
            input.raise('Syntax Error: only function can be void')
        }
    }


    function parseWhile() {
        expectKeyword('while')
        let paren = 0
        let tokens = []
        do {
            if (match('(')) paren++
            if (match(')')) paren--
            tokens.push(input.next())
        } while (paren !== 0)
        const body = []
        expect('{')
        while (!match('}')) {
            body.push(parseStatement(body))
            if (!input.eof()) if (match(';')) expect(';')
        }
        expect('}')
        return factory.WhileStatement(parseExp(tokens, true), body)
    }

    function tokens2Array(tokens) {
        let out = []

        tokens = tokens.slice(1, tokens.length-1)
        for (let t in tokens) {
            if ((t & 1) !== 1) out.push(tokens[t])
        }
        return out
    }

}

