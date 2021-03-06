/**
 * parse.js
 * 
 * Phase I
 * 
 * Recursive Descent Parser for D`ish
 * Parses statements and builds linkage infrastructure 
 * Collect and save type info
 * 
 * 
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
    const codegen = require('escodegen')
    const esprima = require('esprima')
    const Field = require('./classes/Field')
    const Symbol = require('./classes/Symbol')
    const Token = require('./classes/Token')
    const factory = require('./ilfactory')
    const lexer = require('./lexer')
    const ast = { type: 'Program', body: [] }
    const ctor = {args:[], body:[]}
    const symtbl = { global: {} }
    const exporting = {}
    const types = {}
    const api = {}
    const data = []

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

    /** get an ast fragment */
    function fragment(ex) {
        return esprima.parse(ex).body[0].expression
    }

    /** 
     * reduce a list of tokens to a list of token.values
     */
    function values(tokens) {
        const t1 = []
        for (let t in tokens) {
            t1.push(tokens[t].value)
        }
        return t1
    }


    /** shortcut to input.match */
    function match(ch) {
        return input.match(ch)
    }
    /** shortcut to input.matchKeyword */
    function matchKeyword(kw) {
        return input.matchKeyword(kw)
    }
    /** shortcut to input.expect */
    function expect(ch) {
        return input.expect(ch)
    }
    /** shortcut to input.expectKeyword */
    function expectKeyword(kw) {
        return input.expectKeyword(kw)
    }

    /** Top Level: Parse Module */
    function parseModule(body) {
        expectKeyword('module') //  first keyword is required
        moduleName = input.next().value
        expect(';')

        while (!input.eof()) {
            const node = parseGlobal(body)
            if (node) body.push(node)
            if (!input.eof()) if (match(';')) expect(';')
        }
    }

    /** Top Level: Parse Class */
    function parseClass(body) {
        expectKeyword('class') //  first keyword is required
        moduleName = input.next().value
        expect('{')
        while (!input.eof()) {
            isPublic = true
            isStatic = false
            isConst = false
            const node = parseGlobal(body)
            if (node) body.push(node)
            if (!input.eof()) if (match(';')) expect(';')
            if (match('}')) break
        }
        expect('}')
        /**
         * constructor
         */
        exporting.ctor = 'ctor'
        const size = Field.last
        const params = [fragment('self|0')]
        for (let i=0; i<ctor.args.length; i++) {
            switch (ctor.args[i].type.value) {
                case 'float': 
                    float = true
                    params.push(fragment(`fround(${ctor.args[i].name.value})`))
                    break
                case 'double':
                    params.push(fragment(`+${ctor.args[i].name.value}`))
                    break
                default:
                    params.push(fragment(`${ctor.args[i].name.value}|0`))

            }
        }

        malloc = true
        ctor.body.push(factory.IntDeclaration('self'))
        ctor.body.push(factory.New('self', { "type": "Literal", "value": size }))
        ctor.body.push(factory.CallExpression(moduleName, params))
        ctor.body.push(factory.Return(fragment('self|0')))
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
            priorScope = currentScope
            for (let name in symtbl[currentScope]) {
                const sym = symtbl[currentScope][name]
                if (sym.init) {
                    if (sym.array) {
                        malloc = true
                        const tokens = tokens2Array(sym.init)
                        body.push(factory.New(name, { "type": "Literal", "value": tokens.length }))
                        for (let t in tokens) {
                            const sname = `${sym.heap}[(${name}+${t})<<2>>2]`
                            const value = parseExpression(null, [tokens[t]], false).expression
                            body.push(factory.AssignmentStatement(sname, value))
                        }
                    } else {
                        imtype = sym.type
                        body.push(parseExpression([sym.name], sym.init, false))
                    }
                }
            }
        }
        //=================================
        if (matchKeyword('throw'))      return parseThrow(body)
        if (matchKeyword('break'))      return parseBreak()
        if (matchKeyword('continue'))   return parseContinue()
        if (matchKeyword('do'))         return parseDo()
        if (matchKeyword('for'))        return parseFor()
        if (matchKeyword('if'))         return parseIf()
        if (matchKeyword('print'))      return parsePrint(body)
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()
        //=================================

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
            return parseExpression(null, lhs, isReturn)
        } else {
            return parseExpression(lhs, rhs, false)
        }

    }


    /**
     * Parse expression
     * 
     * entry point to parsing an expression
     * 
     * @param lhs   left hand side of the expression
     * @param rhs   right hand side of the expression
     * @param isEeturn true if this is a return expression
     * @return compiled ast
     */
    function parseExpression(lhs, rhs, isReturn) {
        if (isReturn) {
            return factory.Return(esprima.parse(rhs.join(' ')).body[0])
        } else if (lhs == null) {
            return esprima.parse(rhs.join(' ')).body[0]
        } else {
            return esprima.parse(`${lhs.join(' ')} = ${rhs.join(' ')}`).body[0]
        }
    }

    
    /**
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
        if (isClass && !isStatic) {
            api[currentScope]['self'] = moduleName//'int'
            args.push({type: new Token(Token.Variable, moduleName), name: new Token(Token.Variable, 'self')})
        }
        expect('(')
        while (!match(')')) {
            let isArray = false
            const apiType = input.next()
            if (match('[')) {
                isArray = true
                expect('[')
                expect(']')
            }
            const apiName = input.next()
            api[currentScope][apiName.value] = apiType.value
            args.push({ type: apiType, name: apiName, array:isArray})
            if (isCtor) {
                ctor.args.push({ type: apiType, name: apiName, array:isArray})
                api['ctor'] = api['ctor'] || {}
                api['ctor'][apiName.value] = apiType.value
            }
            if (match(',')) input.next()
        }
        expect(')')

        const body = block = []

        for (let i=0; i<args.length; i++) {
            //const isArray = 
            const size = args[i].type.value === 'double' ? 3 : 2;
            symtbl[name.value][args[i].name.value] = new Symbol(args[i].name.value, args[i].type.value, false, '', args[i].array)
            //    constructor(name, type, func, init, array, immutable) {

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
                inits.push(parseExpression(null, tokens, false).expression)
                name = ''
            } else { /** just copy the token to the output stack */
                tokens.push(input.next().value)
            }
        }
        names.push(name)
        inits.push(parseExpression(null, tokens, false).expression)
        if (names.length === 1) {
            return factory.AssignmentStatement(names[0], parseExpression(null, tokens, false).expression)
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
            if (isClass && scope === 'global' && !isStatic) {
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

        return factory.DoWhileStatement(parseExpression(null, values(tokens), false).expression, body)
        
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
            if (isClass && scope === 'global' && !isStatic) {
                data.push(new Field(isPublic, isStatic, isConst, name.value, 'double', isArray, alloc))
            } else {
                symtbl[scope][name.value] = new Symbol(name.value, 'double', false, '', isArray)
                return factory.DoubleDeclaration(name.value)
            }
        }
    }

    function parseExport(which) {
        expectKeyword(which)
        if (matchKeyword('static')) {
            expectKeyword('static')
            isStatic = true
        }
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
            if (isClass && scope === 'global' && !isStatic) {
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
        const _cond = parseExpression(null, values(tokens), false).expression
        const _update = update.length>0?update[0].expression:null

        return factory.ForStatement(_init, _cond, _update, body)
        
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
            if (isClass && scope === 'global' && !isStatic) {
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

        //console.log(values(tokens))
        const _cond = parseExpression(null, values(tokens), false).expression
        const _then = consequent.length === 0 ? null : { "type": "BlockStatement", "body": consequent }
        const _else = alternate.length === 0 ? null : { "type": "BlockStatement", "body": alternate }

        return factory.IfStatement(_cond, _then, _else)
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

    function parseThrow(body) {
        const args = []
        expectKeyword('throw')
        const name = input.next().value
        const isReturn = symtbl.global[currentScope].type === 'void'?false:true
        expect('(')
        while (!match(')')) {
            let arg = input.next()
            switch(arg.type) {
                case Token.Number:
                    args.push({"type": "BinaryExpression",
                                "operator": "|",
                                "left": {
                                    "type": "Literal",
                                    "value": arg.value
                                },
                                "right": {
                                    "type": "Literal",
                                    "value": 0,
                                    "raw": "0"
                                }
                            })                        
                    break
                case Token.Variable:
                    args.push({"type": "BinaryExpression",
                                "operator": "|",
                                "left": {
                                    "type": "Identifier",
                                    "name": arg.value
                                },
                                "right": {
                                    "type": "Literal",
                                    "value": 0,
                                    "raw": "0"
                                }
                            })
                    break
            }
        }
        expect(')')
        if (isReturn) {
            return factory.Throw(name, args, isReturn)
        } else {
            body.push(factory.Throw(name, args, isReturn))
            return factory.Return()
        }
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
        return factory.SwitchStatement(parseExpression(null, values(tokens), false).expression, cases)
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
            if (isClass && scope === 'global' && !isStatic) {
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
        return factory.WhileStatement(parseExpression(null, values(tokens), false).expression, body)
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

