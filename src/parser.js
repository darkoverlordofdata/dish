/**
 * parse.js
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
    const factory = require('./factory')
    const Ast = require('./classes/Ast')
    const Field = require('./classes/Field')
    const Symbol = require('./classes/Symbol')
    const Term = require('./classes/Term')
    const Token = require('./classes/Token')
    const Triad = require('./classes/Triad')
    const ast = { type: 'Program', body: [] }
    const symtbl = { global: {} }
    const exporting = {}
    const types = {}
    const api = {}
    const data = []

    let uniqueId = 1
    let moduleName = ''
    let current = ''
    let block = [] // current output block
    let currentScope = ''
    let priorScope = ''
    let injectInit = false
    let isClass = false
    let isPublic = false
    let isStatic = false
    let isConst = false
    let float = false
    let malloc = false
    let heapi8 = false
    let heapu8 = false
    let heapi16 = false
    let heapu16 = false
    let heapi32 = false
    let heapu32 = false
    let heapf32 = false
    let heapf64 = false
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
            heapi8: heapi8,     //  heap views:
            heapu8: heapu8,
            heapi16: heapi16,
            heapu16: heapu16,
            heapi32: heapi32,
            heapu32: heapu32,
            heapf32: heapf32,
            heapf64: heapf64,
            exports: exporting,  //  exported API
            api: api,
            data: data,
            size: Field.last,
            'class': isClass
        }
        
    } catch (ex) {
        console.log(ex.message)
        console.log(ex.stack)
        process.exit(0)
    }


    /**
     * test if the token is a delimiter  
     */
    function match(ch) {
        const tok = input.peek()
        return tok.type === Token.Delimiter && tok.value === ch
    }

    /**
     * test if the token is a keyword  
     */
    function matchKeyword(kw) {
        const tok = input.peek()
        return tok.type === Token.Keyword && tok.value === kw
    }

    /**
     * Token MUST match the delimiter
     */
    function expect(ch) {
        if (match(ch)) input.next()
        else input.raise(`Expecting delimiter: [${ch}]`)
    }

    /**
     * Token MUST match the keyword
     */
    function expectKeyword(kw) {
        if (matchKeyword(kw)) input.next()
        else input.raise(`Expecting keyword: [${kw}]`)
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
                        body.push(factory.New(name, sym.size, { "type": "Literal", "value": tokens.length }))
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
        if (matchKeyword('print'))      return parsePrint()
        if (matchKeyword('return'))     return parseReturn(body)
        if (matchKeyword('switch'))     return parseSwitch()
        if (matchKeyword('while'))      return parseWhile()
        //=================================
        // const ex = alt.parseExpression(body)
        // if (ex) return ex
       return parseExpression(body, input.next().value, false)
 
    }    
    
    function parseReturn(body) {
        expectKeyword('return')
        if (match(';')) return factory.Return()

        /** parse the return expression */
        const ast = parseExpression(body, mangle?'$00':'__00__', true)

        let castExpression = ''
        switch(symtbl.global[currentScope].type) {
            case 'bool':    castExpression = `((${mangle?'$00':'__00__'})|0)`; break
            case 'uint':    castExpression = `((${mangle?'$00':'__00__'})|0)`; break
            case 'int':     castExpression = `((${mangle?'$00':'__00__'})|0)`; break
            case 'double':  castExpression = `+(${mangle?'$00':'__00__'})`; break
            case 'float':   castExpression = `fround(${mangle?'$00':'__00__'})`; break
            case 'void':    castExpression = 'void 0'; break
            default:        castExpression = `((${mangle?'$00':'__00__'})|0)`; break
        }
        let value = factory.Return(parseExp(castExpression))
        body.push(ast)
        return value

    }

    /**
     * The guts are here in the expression parser
     */
    function parseExpression(body, name, isReturn) {

        const rhs = []
        const index = []
        let isArray = false
        let indexer = false
        let property = false
        let member = ''
        let method = ''
        let self = ''

        if (!isReturn)  { /** process LHS */
            if (match('+')) { /** AutoIncrement */
                expect('+')
                if (match('+')) {
                    expect('+')
                    return factory.AutoIncrement(name)
                }
                input.raise('Expected [++]')
            }
            if (match('-')) { /** AutoDecrement */
                expect('-')
                if (match('-')) {
                    expect('-')
                    return factory.AutoDecrement(name)
                }
                input.raise('Expected [--]')
            }
            if (match('(')) { /** Call Function */
                input.putBack()
                return parseCall()
            }

            /** LHS */
            if (match('=')) {               /** x = */
                expect('=')
            } else if (match('.')) {        /** x.member = */
                                            /** x.member[index] = */
                                            /** x.member(p) */
                expect('.')
                property = true
                member = input.next().value
                if (match('=')) {
                    expect('=')
                }
                else {
                    const method = `${symtbl[currentScope][name].type}_${member}`
                    const arg = [[
                        new Token(Token.Variable, name),
                        new Token(Token.Delimiter, '|'),
                        new Token(Token.Number, '0')
                    ]]
                    let pos = 1

                    if (match('(')) { /** Call Method: o.method(...) */
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
                        return factory.CallExpression(method, params)

                    } else if (match('[')) { /** Property Array: o.field[index] = value; */
                        /**
                         * o.field[index] = value
                         * HEAPI32[o+field+index] = value
                         */
                        isArray = true
                        expect('[')
                        while (!match(']')) {
                            index.push(input.next().value)
                        }
                        expect(']')
                        expect('=')
                    } else input.raise('Invalid property/method')
                    
                }
            } else if (match('[')) {        /** x[exp] =  */
                expect('[')
                indexer = true
                while (!match(']')) {
                    index.push(input.next().value)
                }
                expect(']')
                if (match('.')) {           /** x[exp].member = */
                    expect('.')
                    property = true
                    member = input.next().value
                    if (match('=')) expect('=')
                    else input.raise('Invalid LHS(2) in assignment')
                } else if (match('=')) expect('=')
                else input.raise('Invalid LHS(3) in assignment')
            } else input.raise('Invalid LHS(4) in assignment')

            if (member !== '') { /** Encode lhsvalue */
                const sym = symtbl[currentScope][name]
                const def = lookupField(sym.type, member)
                index.push(def.offset)
            }
        }
        /** RHS */
        while (!match(';')) {
            if (matchKeyword('new')) {
                expectKeyword('new') 
                let size = 0
                let tokens = []
                let token = null
                if (matchKeyword('int')) {
                    expectKeyword('int')
                    size = 2
                    heapi32 = true
                } else if (matchKeyword('uint')) {
                    expectKeyword('uint')
                    size = 2
                    heapu32 = true
                } else if (matchKeyword('bool')) {
                    expectKeyword('bool')
                    size = 2
                    heapu32 = true
                } else if (matchKeyword('float')) {
                    expectKeyword('float')
                    size = 2
                    heapf32 = true
                } else if (matchKeyword('double')) {
                    expectKeyword('double')
                    size = 3
                    heapf64 = true
                } else {
                    malloc = true
                    let klass = input.next()

                    const ext = require('../dish.json')
                    const size = ext[packge][klass.value].size
                    const ctor = `${klass.value}_${klass.value}`
                    const arg = [[
                        new Token(Token.Variable, name),
                        new Token(Token.Delimiter, '|'),
                        new Token(Token.Number, '0')
                    ]]
                    let pos = 1
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

                    body.push(factory.New(name, 2, { "type": "Literal", "value": size }))
                    return factory.CallExpression(ctor, params)
                }
                expect('[')
                while (!match(']')) {
                    token = input.next();
                }
                expect(']')
                malloc = true
                switch (token.type) {
                    case Token.Variable:
                        return factory.New(name, size, { "type": 'Identifier', "name": token.value })
                    case Token.Number:
                        return factory.New(name, size, { "type": "Literal", "value": token.value }) //, "raw": ""+token.value })
                    default:
                        input.raise('Expecting [Literal|Identifier]')
                }
            } else if (match('.')) {
                expect('.')
                method = input.next().value
                
                if (match('(')) { /** x = obj.method(...) */
                    expect('(')
                    const name = rhs[0].value
                    rhs[0].value = `${symtbl[currentScope][rhs[0].value].type}_${method}`
                    rhs.push(new Token(Token.Delimiter, '('))
                    rhs.push(new Token(Token.Variable, name))
                    rhs.push(new Token(Token.Delimiter, '|'))
                    rhs.push(new Token(Token.Number, '0'))
                    let pos = 1

                    while (!match(')')) {
                        if (match(',')) {
                            expect(',')
                            rhs.push(new Token(Token.Delimiter, ','))
                        } else {
                            //TODO: Coerce params - p1|0, +p2, fround(p3)
                            rhs.push(input.next()) 
                        }

                    }
                    expect(')')
                    rhs.push(new Token(Token.Delimiter, ')'))
                    method = ''  
                }
            } else {
                rhs.push(input.next())
            }
        }

        /** Decode RHS of object.field */
        if (method !== '') {
            self = rhs[0].value
            let sym = symtbl[currentScope][self]
            if (rhs.length === 1) {/** Property */
                const def = lookupField(sym.type, method)
                if (def.static) input.raise(`Invalid static type ${sym.type}.${method}`)

                rhs.push(new Token(Token.Delimiter, '['))
                rhs.push(new Token(Token.Number, (def.offset)))
                rhs.push(new Token(Token.Delimiter, ']'))
            } else {
                if (rhs[1].value === '[') {
                    const def = lookupField(sym.type, method)
                    if (def.static) input.raise(`Invalid static type ${sym.type}.${method}`)
                    rhs[2].value = `${rhs[2].value} + ${def.offset}`
                }
            }
        }

        const ast = parseExp(fixExpression(rhs))
        const sym = symtbl[currentScope][name]||symtbl['global'][name]

        if (ast.type === 'BinaryExpression' || ast.type === 'MemberExpression' || index.length>0) {
            const lhsvalue = index.length===0?null:parseExp(index.join('+'))
            const lines = transpile(sym, ast, lhsvalue, isArray, mangle)  
            for (let l in lines) {
                const line = lines[l]
                if (parseInt(l, 10) === lines.length-1) {
                    createVar(body, line.name, 'int', 0)
                    return factory.AssignmentStatement(line.name, parseExp(line.code))
                } else {
                    createVar(body, line.name, 'int', 0)
                    body.push(factory.AssignmentStatement(line.name, parseExp(line.code)))
                }

            }
        } else { /**  simple assignment */
            let a;
            switch (ast.type) {
                case 'Literal': 
                    switch (ast.raw) {
                        case 'true': 
                            ast.value = 1
                            ast.raw = '1'
                            break
                        case 'false':
                            ast.value = 0
                            ast.raw = '0'
                            break
                    }
                    a = factory.AssignmentStatement(name, ast)
                    return a
                case 'Identifier':
                    a = factory.AssignmentStatement(name, ast)
                    return a
                case 'CallExpression':
                    if (self !== '') {
                        ast.arguments.unshift(
                        { type: 'BinaryExpression',
                            operator: '|',
                            left: { type: 'Identifier', name: self },
                            right: { type: 'Literal', value: 0, raw: '0' } } 
                        )
                    }
                    switch (sym.type) {
                        case 'int': return factory.AssignmentStatementCallInt(name, ast)
                        case 'uint': return factory.AssignmentStatementCallInt(name, ast)
                        case 'bool': return factory.AssignmentStatementCallInt(name, ast)
                        //case 'float': return factory.AssignmentStatementCallFloat(name, ast)
                        case 'double': return factory.AssignmentStatementCallDouble(name, ast)
                        case 'float': throw new Error('WTF???')
                        default: throw new Error(`Unknown Symbol ${sym.type}`)
                    }
            }
        }


    }

    function lookupField(type, name) {
        let t = null
        if (type === moduleName) {
            t = data
        } else {
            const ext = require('../dish.json')
            t = ext[packge][name].data
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
            if (match(',')) input.next()
        }
        expect(')')

        const body = block = []

        for (let i=0; i<args.length; i++) {
            const size = args[i].type.value === 'double' ? 3 : 2;
            symtbl[name.value][args[i].name.value] = new Symbol(args[i].name.value, args[i].type.value)
            switch(args[i].type.value) {
                case 'bool':    body.push(factory.IntParameter(args[i].name)); break
                case 'uint':    body.push(factory.IntParameter(args[i].name)); break
                case 'int':     body.push(factory.IntParameter(args[i].name)); break
                case 'float':   body.push(factory.FloatParameter(args[i].name)); break
                case 'double':  body.push(factory.DoubleParameter(args[i].name)); break
                default: 
                    if (types[args[i].type.value]) {
                        body.push(factory.IntParameter(args[i].name)); break
                    } else if (args[i].type.value === moduleName) {
                        body.push(factory.IntParameter(args[i].name)); break
                    } else input.raise('Parameter type not found')        
            }
        }

        /** placeholder for variables */
        body.push(body.vars = factory.IntDeclaration(mangle?'$ZZ':'__ZZ__'))

        /** use for return processing */
        switch (type) {
            case 'void': break
            case 'double':  
                body.push(body.vars = factory.DoubleDeclaration(mangle?'$00':'__00__')); 
                symtbl[name.value][mangle?'$00':'__00__'] = new Symbol(mangle?'$00':'__00__', 0)
                break
            case 'float':   
                body.push(body.vars = factory.FloatDeclaration(mangle?'$00':'__00__')); 
                symtbl[name.value][mangle?'$00':'__00__'] = new Symbol(mangle?'$00':'__00__', 0)
                break
            default:
                body.push(body.vars = factory.IntDeclaration(mangle?'$00':'__00__'))
                symtbl[name.value][mangle?'$00':'__00__'] = new Symbol(mangle?'$00':'__00__', 0)
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
            heapi32 = true
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
            heapi32 = true
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
            heapi32 = true
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

    /**
     * 
     * TODO: pass the symtbl, not sym
     *       lookup member, not self
     * 
     * transpile an expression
     * 
     * @param tokens input ast
     * @param symbol lhs symbol being assigned to
     * @param index optional ast of index for lhs
     * @returns array of output lines
     */
    function transpile(symbol, tokens, index, isArray, mangle) {

        let ptr = 0
        let curr = ''
        let prev = ''
        let stack = []
        let nodes = []
        const code = []

        let name = symbol.name
        let heap = symbol.heap
        let size = symbol.size
        const type = symbol.type
        if (index != null) {
            switch (index.type) {
                case 'Literal':
                    createVar()
                    code.push(new Triad(curr, type, name, '+', index.value))
                    if (isArray) {
                        createVar()
                        code.push(new Triad(curr, type, prev, '<<', size))
                    }
                    break
                case 'Identifier':
                    createVar()
                    code.push(new Triad(curr, type, name, '+', index.name))
                    if (isArray) {
                        createVar()
                        code.push(new Triad(curr, type, prev, '<<', size))
                    }
                    break
                case 'BinaryExpression':
                    traverse(index)
                    nodes = nodes.reverse()
                    codegen()
                    createVar()
                    code.push(new Triad(curr, type, name, '+', prev))
                    if (isArray) {
                        createVar()
                        code.push(new Triad(curr, type, prev, '<<', size))
                    }
                    break
            }
            name = `${heap}[${curr} >> ${size}]`
        }

        ptr = 0
        nodes = []
        stack = []
        traverse(tokens)
        nodes = nodes.reverse()
        codegen()
        let result = stack.pop()

        if (index == null) {
            code[code.length-1].name = name
        } else { /** patch to use the correct heap for class members */
            const left = result.node.name || result.node.value0
            const api = require('../dish.json')
            const data = api[packge][type].data
            for (let ix in data) {
                if (data[ix].name === left) {
                    switch (data[ix].type) {
                        case 'int':     heap = 'HEAPI32'; break
                        case 'uint':    heap = 'HEAPUI32'; break
                        case 'bool':    heap = 'HEAPI32'; break
                        case 'float':   heap = 'HEAPF32'; break
                        case 'double':  
                            heap = 'HEAPF64'
                            size=3
                            heapf64 = true
                            break
                    }
                } 
            }
            name = `${heap}[${curr} >> ${size}]`
            code.push(new Triad(name, type, left))
        }
        return code

        function createVar() {
            prev = curr
            if (mangle) {
                curr = `$${uniqueId}`
                curr = curr.length === 2 ? `$0${uniqueId}` : curr
            } else {
                curr = `__${uniqueId}__`
                curr = curr.length === 5 ? `__0${uniqueId}__` : curr
            }
            uniqueId++
        }

        /**
         * Put the ast nodes into an ordered list
         */
        function traverse(node) {
            switch (node.type) {
                case 'BinaryExpression':
                    nodes.push(new Ast('Operator', node.operator))
                    traverse(node.left)
                    traverse(node.right)
                    break
                case 'MemberExpression':
                    nodes.push(new Ast('Operator', '+', true))
                    traverse(node.object)
                    traverse(node.property)
                    break
                case 'Identifier':
                case 'Literal':
                case 'CallExpression':
                    nodes.push(node)
                    break
            }
        }

        /**
         * iterate the ast node list
         */
        function codegen() {
            while (ptr<nodes.length) {
                const node = nodes[ptr]
                switch (node.type) {
                    case 'Literal':
                    case 'Identifier':
                    case 'CallExpression':
                        stack.push(new Term(node))
                        break
                    case 'Operator':
                        createVar()
                        const op1 = stack.pop()
                        const op2 = stack.pop()
                        code.push(new Triad(curr, type, op1.toString(), node.op, op2.toString()))
                        stack.push(new Term({type: 'Identifier', name: curr})) 
                        if (node.array) {
                            if (isArray) {
                                createVar()
                                code.push(new Triad(curr, type, prev, '<<', 2))
                            }
                            createVar()
                            code.push(new Triad(curr, type, `${heap}[${prev} >> ${size}]`))
                            stack.pop() //# pop off the prev, replace with curr
                            stack.push(new Term({type: 'Identifier', name: curr})) 
                        }
                }
                ptr++
            }

        }
        
    }
 

}

